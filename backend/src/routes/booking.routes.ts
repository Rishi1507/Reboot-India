import { Router } from "express";
import { prisma } from "../db";
import { buildBookingCancellationEmail, sendEmail } from "../lib/email";

const router = Router();
const ADVANCE_PER_SEAT = Number(process.env.ADVANCE_PER_SEAT || 500);

function normalizeSeats(input: any) {
  const seats = input?.numberOfSeats ?? input?.seats ?? input?.numberOfParticipants;
  if (typeof seats === "number") return seats;
  if (typeof seats === "string") return parseInt(seats.trim(), 10);
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

    const departure = await prisma.departure.findUnique({ where: { id: departureId } });
    if (!departure) return res.status(404).json({ error: "Departure not found" });

    const available = departure.totalSeats - departure.bookedSeats;
    if (available < seatsCount) {
      return res.status(400).json({ error: "Not enough seats available in this batch" });
    }

    const totalAmount = seatsCount * departure.pricePerSeat;

    let coupon: any = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: String(couponCode).trim().toUpperCase() },
      });
      if (!coupon || !coupon.isActive) return res.status(400).json({ error: "Invalid coupon" });

      const now = new Date();
      if (coupon.validFrom && now < coupon.validFrom) {
        return res.status(400).json({ error: "Coupon not active yet" });
      }
      if (coupon.validTo && now > coupon.validTo) {
        return res.status(400).json({ error: "Coupon expired" });
      }
      if (coupon.minAmount && totalAmount < coupon.minAmount) {
        return res.status(400).json({ error: `Min booking amount is â‚¹${coupon.minAmount}` });
      }
    }

    const discountAmountRaw =
      coupon && coupon.type === "PERCENT"
        ? Math.floor((totalAmount * coupon.value) / 100)
        : coupon
          ? coupon.value
          : 0;
    const discountAmount = Math.min(Math.max(0, Number(discountAmountRaw || 0)), totalAmount);
    const finalAmount = totalAmount - discountAmount;

    const advanceAmount = Math.min(ADVANCE_PER_SEAT * seatsCount, finalAmount);
    const dueBeforeCredit = Math.max(0, finalAmount - advanceAmount);

    const customer = await prisma.customer.upsert({
      where: { email: userEmail.toLowerCase().trim() },
      update: { fullName: userName.trim(), phone: userPhone.trim() },
      create: {
        fullName: userName.trim(),
        email: userEmail.toLowerCase().trim(),
        phone: userPhone.trim(),
      },
    });

    const creditUsed = Math.min(customer.creditBalance || 0, dueBeforeCredit);
    const amountDue = Math.max(0, dueBeforeCredit - creditUsed);

    const trekkingId = buildTrekkingId();

    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          trekkingId,
          trek: { connect: { id: trekId } },
          departure: { connect: { id: departureId } },
          customer: { connect: { id: customer.id } },
          numberOfSeats: seatsCount,
          totalAmount,
          discountAmount,
          finalAmount,
          amountPaid: 0,
          amountDue,
          creditUsed,
          advanceAmount,
          paymentStatus: "PENDING_ADVANCE",
          status: "PENDING",
          ...(coupon && {
            coupon: { connect: { id: coupon.id } },
          }),
        },
      });

      if (creditUsed > 0) {
        await tx.customer.update({
          where: { id: customer.id },
          data: { creditBalance: { decrement: creditUsed } },
        });
      }

      if (coupon) {
        await tx.couponRedemption.create({
          data: {
            couponId: coupon.id,
            bookingId: created.id,
            customerEmail: customer.email,
            status: "PENDING",
          },
        });
      }

      return created;
    });

    return res.json({
      success: true,
      id: booking.id,
      bookingId: booking.id,
      trekkingId: booking.trekkingId,
      advanceAmount,
      amountDue,
      creditUsed,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return res.status(500).json({ error: "Failed to create booking" });
  }
});

router.post("/:id/cancel", async (req, res) => {
  try {
    const bookingId = String(req.params.id || "").trim();
    const emailOrPhone = String(req.body?.emailOrPhone || "").trim().toLowerCase();
    if (!emailOrPhone) return res.status(400).json({ error: "Email or phone is required" });

    const updated = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { customer: true, departure: true, trek: true, coupon: true },
      });
      if (!booking) return null;

      const matches =
        booking.customer.email.toLowerCase() === emailOrPhone ||
        booking.customer.phone.trim() === emailOrPhone;
      if (!matches) throw new Error("NOT_OWNER");

      if (booking.status === "CANCELLED") {
        return { booking, creditGranted: 0, creditBalance: booking.customer.creditBalance };
      }

      const now = new Date();
      if (new Date(booking.departure.startDate).getTime() <= now.getTime()) {
        throw new Error("TOO_LATE");
      }
      if (booking.paymentStatus === "FULLY_PAID") {
        throw new Error("FULLY_PAID");
      }

      if (booking.status === "CONFIRMED") {
        const newBookedSeats = Math.max(0, (booking.departure.bookedSeats || 0) - booking.numberOfSeats);
        await tx.departure.update({
          where: { id: booking.departureId },
          data: { bookedSeats: newBookedSeats },
        });
      }

      // Cancel coupon redemption (and revert usedCount if it was already confirmed).
      if (booking.couponId) {
        const hadConfirmedRedemption =
          (await tx.couponRedemption.count({
            where: { bookingId, couponId: booking.couponId, status: "CONFIRMED" },
          })) > 0;

        await tx.couponRedemption.updateMany({
          where: { bookingId, couponId: booking.couponId },
          data: { status: "CANCELLED" },
        });

        if (hadConfirmedRedemption) {
          const c = await tx.coupon.findUnique({ where: { id: booking.couponId } });
          if (c) {
            await tx.coupon.update({
              where: { id: c.id },
              data: { usedCount: Math.max(0, (c.usedCount || 0) - 1) },
            });
          }
        }
      }

      let creditGranted = 0;
      if ((booking.amountPaid || 0) > 0 && (booking.creditGranted || 0) === 0) {
        creditGranted = booking.amountPaid;
        await tx.customer.update({
          where: { id: booking.customerId },
          data: { creditBalance: { increment: creditGranted } },
        });
      }

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          creditGranted: creditGranted > 0 ? creditGranted : undefined,
        },
        include: { customer: true, departure: true, trek: true },
      });

      return {
        booking: updatedBooking,
        creditGranted,
        creditBalance: updatedBooking.customer.creditBalance,
      };
    });

    if (!updated) return res.status(404).json({ error: "Booking not found" });

    if (updated.booking && updated.creditGranted >= 0) {
      const b = updated.booking as any;
      const html = buildBookingCancellationEmail({
        customerName: b.customer.fullName,
        trekkingId: b.trekkingId,
        trekTitle: b.trek.title,
        startDate: new Date(b.departure.startDate).toDateString(),
        seats: b.numberOfSeats,
        creditGranted: updated.creditGranted,
        creditBalance: updated.creditBalance,
      });
      await sendEmail({
        to: b.customer.email,
        subject: `Booking Cancelled - ${b.trek.title}`,
        html,
        bookingId: b.id,
      });
    }

    return res.json({
      success: true,
      bookingId,
      status: updated.booking.status,
      creditGranted: updated.creditGranted,
      creditBalance: updated.creditBalance,
    });
  } catch (err: any) {
    if (err?.message === "NOT_OWNER") return res.status(403).json({ error: "Unauthorized" });
    if (err?.message === "TOO_LATE") {
      return res.status(400).json({ error: "Cancellation is not allowed after trek start date" });
    }
    if (err?.message === "FULLY_PAID") {
      return res.status(400).json({ error: "Fully paid bookings cannot be cancelled online. Contact support." });
    }
    console.error("Booking cancel error:", err);
    return res.status(500).json({ error: "Failed to cancel booking" });
  }
});

router.post("/lookup", async (req, res) => {
  try {
    const { emailOrPhone, trekkingId, bookingId } = req.body || {};
    if (!emailOrPhone && !trekkingId && !bookingId) {
      return res.status(400).json({ error: "Provide email/phone, trekking ID, or booking ID" });
    }

    const bookings = await prisma.booking.findMany({
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
        ].filter(Boolean) as any,
      },
      include: {
        trek: true,
        departure: true,
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ bookings });
  } catch (err) {
    console.error("Booking lookup error:", err);
    return res.status(500).json({ error: "Failed to lookup bookings" });
  }
});

export default router;
