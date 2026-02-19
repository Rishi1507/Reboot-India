import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import healthRoutes from "./routes/health.routes";
import bookingRoutes from "./routes/booking.routes";
import adminRoutes from "./routes/admin.routes";
import paymentRoutes from "./routes/payment.routes";
import trekRoutes from "./routes/trek.routes";
import couponRoutes from "./routes/coupon.routes";
import faqRoutes from "./routes/faq.routes";
import publicRoutes from "./routes/public.routes";
import { prisma } from "./db";
import { buildBatchMessageEmail, buildPaymentReminderEmail, sendEmail } from "./lib/email";

dotenv.config();

const app = express();
app.use(cors());
// Admin can upload images as data URLs (base64) in trek blogs/reviews. Those payloads can be large.
app.use(express.json({ limit: "250mb" }));
app.use(express.urlencoded({ extended: true, limit: "250mb" }));

app.use(healthRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/treks", trekRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api", publicRoutes);

async function runBookingAutomations() {
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const dueBookings = await prisma.booking.findMany({
    where: {
      amountDue: { gt: 0 },
      dueReminderSentAt: null,
      departure: { startDate: { gte: now, lte: twoDaysFromNow } },
    },
    include: { customer: true, trek: true, departure: true },
  });

  await Promise.all(
    dueBookings.map(async (booking) => {
      const html = buildPaymentReminderEmail({
        customerName: booking.customer.fullName,
        trekTitle: booking.trek.title,
        startDate: new Date(booking.departure.startDate).toDateString(),
        amountDue: booking.amountDue,
        paymentLink: `${process.env.FRONTEND_URL || "https://rebootindia.co.in"}/customer/booking?bookingId=${booking.id}`,
      });
      await sendEmail({
        to: booking.customer.email,
        subject: `Pending Payment Reminder - ${booking.trek.title}`,
        html,
        bookingId: booking.id,
      });
      await prisma.booking.update({
        where: { id: booking.id },
        data: { dueReminderSentAt: new Date() },
      });
    }),
  );

  const welcomeBookings = await prisma.booking.findMany({
    where: {
      welcomeSentAt: null,
      departure: { startDate: { gte: now, lte: oneDayFromNow } },
      status: "CONFIRMED",
    },
    include: { customer: true, trek: true, departure: true },
  });

  await Promise.all(
    welcomeBookings.map(async (booking) => {
      const html = buildBatchMessageEmail({
        customerName: booking.customer.fullName,
        subject: `Welcome to ${booking.trek.title}`,
        message:
          "Your trek begins tomorrow. Please keep your ID proof and essentials ready. Vehicle details will be shared by your trek coordinator.",
      });
      await sendEmail({
        to: booking.customer.email,
        subject: `Welcome - ${booking.trek.title}`,
        html,
        bookingId: booking.id,
      });
      await prisma.booking.update({
        where: { id: booking.id },
        data: { welcomeSentAt: new Date() },
      });
    }),
  );
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  if (process.env.ENABLE_BOOKING_AUTOMATION !== "false") {
    runBookingAutomations().catch((err) =>
      console.error("Initial automation run failed:", err),
    );
    setInterval(() => {
      runBookingAutomations().catch((err) =>
        console.error("Automation run failed:", err),
      );
    }, 6 * 60 * 60 * 1000);
  }
});
