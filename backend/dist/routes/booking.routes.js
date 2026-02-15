"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
const ADVANCE_PER_SEAT = Number(process.env.ADVANCE_PER_SEAT || 500);
function normalizeSeats(input) {
    const seats = input?.numberOfSeats ?? input?.seats ?? input?.numberOfParticipants;
    if (typeof seats === "number")
        return seats;
    if (typeof seats === "string")
        return parseInt(seats.trim(), 10);
    return NaN;
}
function buildTrekkingId() {
    const stamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900).toString();
    return `TRK-${stamp}${random}`;
}
router.post("/", async (req, res) => {
    try {
        const { trekId, departureId, userName, userEmail, userPhone, couponCode } = req.body;
        const seatsCount = normalizeSeats(req.body);
        if (!trekId || !departureId) {
            return res.status(400).json({ error: "Invalid trekId or departureId" });
        }
        if (!userName || !userEmail || !userPhone) {
            return res.status(400).json({ error: "Missing customer details" });
        }
        if (!Number.isInteger(seatsCount) || seatsCount <= 0) {
            return res.status(400).json({ error: "Invalid numberOfSeats" });
        }
        const departure = await db_1.prisma.departure.findUnique({ where: { id: departureId } });
        if (!departure)
            return res.status(404).json({ error: "Departure not found" });
        const available = departure.totalSeats - departure.bookedSeats;
        if (available < seatsCount) {
            return res.status(400).json({ error: "Not enough seats available in this batch" });
        }
        const totalAmount = seatsCount * departure.pricePerSeat;
        const advanceAmount = Math.min(ADVANCE_PER_SEAT * seatsCount, totalAmount);
        const finalAmount = totalAmount;
        const amountDue = Math.max(0, finalAmount - advanceAmount);
        const customer = await db_1.prisma.customer.upsert({
            where: { email: userEmail.toLowerCase().trim() },
            update: { fullName: userName.trim(), phone: userPhone.trim() },
            create: {
                fullName: userName.trim(),
                email: userEmail.toLowerCase().trim(),
                phone: userPhone.trim(),
            },
        });
        const trekkingId = buildTrekkingId();
        const booking = await db_1.prisma.booking.create({
            data: {
                trekkingId,
                trek: { connect: { id: trekId } },
                departure: { connect: { id: departureId } },
                customer: { connect: { id: customer.id } },
                numberOfSeats: seatsCount,
                totalAmount,
                discountAmount: 0,
                finalAmount,
                amountPaid: 0,
                amountDue,
                advanceAmount,
                paymentStatus: "PENDING_ADVANCE",
                status: "PENDING",
                ...(couponCode && {
                    coupon: { connect: { code: String(couponCode).trim().toUpperCase() } },
                }),
            },
        });
        if (couponCode) {
            const coupon = await db_1.prisma.coupon.findUnique({
                where: { code: String(couponCode).trim().toUpperCase() },
            });
            if (coupon) {
                await db_1.prisma.couponRedemption.create({
                    data: {
                        couponId: coupon.id,
                        bookingId: booking.id,
                        customerEmail: customer.email,
                        status: "PENDING",
                    },
                });
            }
        }
        return res.json({
            success: true,
            id: booking.id,
            bookingId: booking.id,
            trekkingId: booking.trekkingId,
            advanceAmount,
            amountDue,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
        });
    }
    catch (error) {
        console.error("Booking creation error:", error);
        return res.status(500).json({ error: "Failed to create booking" });
    }
});
router.post("/lookup", async (req, res) => {
    try {
        const { emailOrPhone, trekkingId, bookingId } = req.body || {};
        if (!emailOrPhone && !trekkingId && !bookingId) {
            return res.status(400).json({ error: "Provide email/phone, trekking ID, or booking ID" });
        }
        const bookings = await db_1.prisma.booking.findMany({
            where: {
                OR: [
                    bookingId ? { id: String(bookingId).trim() } : undefined,
                    trekkingId ? { trekkingId: String(trekkingId).trim().toUpperCase() } : undefined,
                    emailOrPhone
                        ? {
                            customer: {
                                OR: [
                                    { email: String(emailOrPhone).trim().toLowerCase() },
                                    { phone: String(emailOrPhone).trim() },
                                ],
                            },
                        }
                        : undefined,
                ].filter(Boolean),
            },
            include: {
                trek: true,
                departure: true,
                customer: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return res.json({ bookings });
    }
    catch (err) {
        console.error("Booking lookup error:", err);
        return res.status(500).json({ error: "Failed to lookup bookings" });
    }
});
exports.default = router;
