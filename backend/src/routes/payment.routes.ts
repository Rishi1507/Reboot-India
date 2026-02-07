import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "../../db";
import { buildBookingEmail, sendEmail } from "../lib/email";

const router = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * Create Razorpay Order
 */
router.post("/create-order", async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: "Missing bookingId" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        departure: true,
        coupon: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const totalAmount =
      booking.numberOfSeats * booking.departure.pricePerSeat;

    let discountAmount = 0;
    let finalAmount = totalAmount;

    if (booking.coupon) {
      if (booking.coupon.type === "PERCENT") {
        discountAmount = Math.floor(
          (totalAmount * booking.coupon.value) / 100
        );
      } else {
        discountAmount = booking.coupon.value;
      }
      if (discountAmount > totalAmount) discountAmount = totalAmount;
      finalAmount = totalAmount - discountAmount;
    }

    const payable = finalAmount;

    const order = await razorpay.orders.create({
      amount: payable * 100, // INR → paise
      currency: "INR",
      receipt: bookingId,
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        razorpayOrderId: order.id,
        totalAmount,
        discountAmount,
        finalAmount,
      },
    });

    await prisma.payment.upsert({
      where: { bookingId },
      update: {
        provider: "RAZORPAY",
        amount: payable,
        status: "CREATED",
        orderId: order.id,
      },
      create: {
        bookingId,
        provider: "RAZORPAY",
        amount: payable,
        status: "CREATED",
        orderId: order.id,
      },
    });

    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

/**
 * Verify Razorpay Payment
 */
router.post("/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
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

    await tx.payment.upsert({
      where: { bookingId },
      update: {
        status: "PAID",
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
      create: {
        bookingId,
        provider: "RAZORPAY",
        amount: booking.finalAmount || booking.totalAmount,
        status: "PAID",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
    });

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

    return booking;
  });

  const html = buildBookingEmail({
    customerName: updated.customer.fullName,
    trekTitle: updated.trek.title,
    startDate: new Date(updated.departure.startDate).toDateString(),
    endDate: new Date(updated.departure.endDate).toDateString(),
    seats: updated.numberOfSeats,
    totalAmount: updated.totalAmount,
    discountAmount: updated.discountAmount,
    finalAmount: updated.finalAmount || updated.totalAmount,
  });

  await sendEmail({
    to: updated.customer.email,
    subject: `Booking Confirmed - ${updated.trek.title}`,
    html,
    bookingId: updated.id,
  });

  res.json({ success: true });
});

export default router;
