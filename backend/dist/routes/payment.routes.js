"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../db");
const email_1 = require("../lib/email");
const router = (0, express_1.Router)();
const ADVANCE_PER_SEAT = Number(process.env.ADVANCE_PER_SEAT || 500);
const FULL_DISCOUNT_HOURS_BEFORE_START = Number(process.env.FULL_PAYMENT_DISCOUNT_HOURS_BEFORE_START || 48);
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
router.post("/create-order", async (req, res) => {
    try {
        const { bookingId, stage } = req.body;
        if (!bookingId)
            return res.status(400).json({ error: "Missing bookingId" });
        const booking = await db_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { departure: true, coupon: true },
        });
        if (!booking)
            return res.status(404).json({ error: "Booking not found" });
        const totalAmount = booking.numberOfSeats * booking.departure.pricePerSeat;
        let discountAmount = 0;
        let finalAmount = totalAmount;
        if (booking.coupon) {
            discountAmount =
                booking.coupon.type === "PERCENT"
                    ? Math.floor((totalAmount * booking.coupon.value) / 100)
                    : booking.coupon.value;
            discountAmount = Math.min(discountAmount, totalAmount);
            finalAmount = totalAmount - discountAmount;
        }
        const desiredStage = stage === "FULL" ? "FULL" : "ADVANCE";
        const alreadyPaid = booking.amountPaid || 0;
        const creditUsed = booking.creditUsed || 0;
        const dueBeforeDiscount = Math.max(0, finalAmount - alreadyPaid - creditUsed);
        const fullPaymentDiscountPercent = booking.fullPaymentDiscountPercent || 10;
        const discountDeadlineAt = new Date(booking.departure.startDate).getTime() -
            FULL_DISCOUNT_HOURS_BEFORE_START * 60 * 60 * 1000;
        const fullPaymentDiscountEligible = Date.now() <= discountDeadlineAt;
        const bookingAdvanceAmount = Math.min(booking.advanceAmount || booking.numberOfSeats * ADVANCE_PER_SEAT, finalAmount);
        const fullDiscount = desiredStage === "FULL" && dueBeforeDiscount > 0 && fullPaymentDiscountEligible
            ? Math.floor((dueBeforeDiscount * fullPaymentDiscountPercent) / 100)
            : 0;
        const payable = desiredStage === "ADVANCE"
            ? booking.paymentStatus === "PENDING_ADVANCE"
                ? Math.min(bookingAdvanceAmount, dueBeforeDiscount || finalAmount)
                : dueBeforeDiscount
            : Math.max(0, dueBeforeDiscount - fullDiscount);
        if (payable <= 0)
            return res.status(400).json({ error: "No amount pending for payment" });
        const order = await razorpay.orders.create({
            amount: payable * 100,
            currency: "INR",
            receipt: bookingId,
            notes: { bookingId, stage: desiredStage },
        });
        await db_1.prisma.booking.update({
            where: { id: bookingId },
            data: {
                razorpayOrderId: order.id,
                totalAmount,
                discountAmount,
                finalAmount,
                amountDue: dueBeforeDiscount,
            },
        });
        await db_1.prisma.payment.create({
            data: {
                bookingId,
                provider: "RAZORPAY",
                amount: payable,
                status: "CREATED",
                stage: desiredStage,
                orderId: order.id,
            },
        });
        return res.json({
            success: true,
            order,
            payable,
            fullPaymentDiscountApplied: fullDiscount,
            fullPaymentDiscountEligible,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to create order" });
    }
});
router.post("/verify", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expected = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");
        if (expected !== razorpay_signature) {
            return res.status(400).json({ error: "Invalid signature" });
        }
        const updated = await db_1.prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findUnique({
                where: { id: bookingId },
                include: {
                    customer: true,
                    departure: true,
                    trek: true,
                    coupon: true,
                },
            });
            if (!booking)
                throw new Error("Booking not found");
            const payment = await tx.payment.findFirst({
                where: { bookingId, orderId: razorpay_order_id },
                orderBy: { createdAt: "desc" },
            });
            if (!payment)
                throw new Error("Payment order not found");
            const paidAmount = booking.amountPaid + payment.amount;
            const isFullStagePayment = payment.stage === "FULL";
            const remainingDue = isFullStagePayment
                ? 0
                : Math.max(0, booking.finalAmount - paidAmount - (booking.creditUsed || 0));
            const paymentStatus = remainingDue <= 0 || isFullStagePayment ? "FULLY_PAID" : "ADVANCE_PAID";
            await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: "PAID",
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature,
                },
            });
            const bookingUpdated = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: "CONFIRMED",
                    paymentStatus: paymentStatus,
                    amountPaid: paidAmount,
                    amountDue: remainingDue,
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                },
                include: {
                    customer: true,
                    departure: true,
                    trek: true,
                    coupon: true,
                },
            });
            if (booking.status !== "CONFIRMED") {
                await tx.departure.update({
                    where: { id: booking.departureId },
                    data: { bookedSeats: { increment: booking.numberOfSeats } },
                });
            }
            if (booking.couponId) {
                await tx.couponRedemption.updateMany({
                    where: { bookingId, couponId: booking.couponId },
                    data: { status: "CONFIRMED" },
                });
                await tx.coupon.update({
                    where: { id: booking.couponId },
                    data: { usedCount: { increment: 1 } },
                });
            }
            return bookingUpdated;
        });
        const expectedAdvance = Math.min(updated.advanceAmount || updated.numberOfSeats * ADVANCE_PER_SEAT, updated.finalAmount || updated.totalAmount);
        if (updated.amountPaid === expectedAdvance) {
            const html = (0, email_1.buildAdvanceBookingEmail)({
                customerName: updated.customer.fullName,
                trekkingId: updated.trekkingId,
                trekTitle: updated.trek.title,
                startDate: new Date(updated.departure.startDate).toDateString(),
                endDate: new Date(updated.departure.endDate).toDateString(),
                seats: updated.numberOfSeats,
                totalAmount: updated.finalAmount || updated.totalAmount,
                advancePaid: updated.amountPaid,
                amountDue: updated.amountDue,
            });
            await (0, email_1.sendEmail)({
                to: updated.customer.email,
                subject: `Booking Confirmed - ${updated.trek.title}`,
                html,
                bookingId: updated.id,
            });
        }
        return res.json({
            success: true,
            bookingId: updated.id,
            amountPaid: updated.amountPaid,
            amountDue: updated.amountDue,
            paymentStatus: updated.paymentStatus,
        });
    }
    catch (err) {
        console.error("Payment verify error:", err);
        return res.status(500).json({ error: "Failed to verify payment" });
    }
});
router.post("/send-due-reminder", async (req, res) => {
    try {
        const { bookingId } = req.body;
        if (!bookingId)
            return res.status(400).json({ error: "Missing bookingId" });
        const booking = await db_1.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { customer: true, departure: true, trek: true },
        });
        if (!booking)
            return res.status(404).json({ error: "Booking not found" });
        if (booking.amountDue <= 0)
            return res.status(400).json({ error: "No pending amount" });
        const paymentLink = `${process.env.FRONTEND_URL || "https://rebootindia.co.in"}/customer/booking?bookingId=${booking.id}`;
        const html = (0, email_1.buildPaymentReminderEmail)({
            customerName: booking.customer.fullName,
            trekTitle: booking.trek.title,
            startDate: new Date(booking.departure.startDate).toDateString(),
            amountDue: booking.amountDue,
            paymentLink,
        });
        await (0, email_1.sendEmail)({
            to: booking.customer.email,
            subject: `Pending Payment Reminder - ${booking.trek.title}`,
            html,
            bookingId: booking.id,
        });
        await db_1.prisma.booking.update({
            where: { id: booking.id },
            data: { dueReminderSentAt: new Date() },
        });
        return res.json({ success: true });
    }
    catch (err) {
        console.error("Send reminder error:", err);
        return res.status(500).json({ error: "Failed to send reminder" });
    }
});
exports.default = router;
