import type { Express, Request, Response } from "express";
import nodemailer from "nodemailer";
import { prisma } from "./db";

/**
 * Register API routes
 */
export async function registerRoutes(app: Express) {

  /* ------------------------------------------------------------------ */
  /*                               TREKS                                */
  /* ------------------------------------------------------------------ */

  // Get all treks with departures
  app.get("/api/treks", async (_req, res) => {
    const treks = await prisma.trek.findMany({
      include: { departures: true },
    });
    res.json(treks);
  });

  // Get single trek by slug
  app.get("/api/treks/:slug", async (req, res) => {
    const trek = await prisma.trek.findUnique({
      where: { slug: req.params.slug },
      include: { departures: true },
    });

    if (!trek) return res.status(404).json({ error: "Trek not found" });
    res.json(trek);
  });

  /* ------------------------------------------------------------------ */
  /*                              BOOKINGS                              */
  /* ------------------------------------------------------------------ */

  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const {
        trekId,
        trekTitle,
        userName,
        userEmail,
        userPhone,
        numberOfSeats,
        totalAmount,
      } = req.body;

      if (
        !trekId ||
        !trekTitle ||
        !userName ||
        !userEmail ||
        !userPhone ||
        !numberOfSeats ||
        !totalAmount
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // CUSTOMER
      const customer = await prisma.customer.upsert({
        where: { email: userEmail },
        update: { fullName: userName, phone: userPhone },
        create: { fullName: userName, email: userEmail, phone: userPhone },
      });

      // BOOKING
      const booking = await prisma.booking.create({
        data: {
          bookingCode: `RI-${Date.now()}`,
          trekTitle,
          seatsBooked: numberOfSeats,
          totalAmount,
          status: "PENDING",
          customerId: customer.id,
          trekId,
        },
      });

      res.json({
        success: true,
        booking,
      });

      // Email async
      sendBookingEmail({
        trekTitle,
        userName,
        userEmail,
        userPhone,
        numberOfSeats,
        totalAmount,
      });
    } catch (err) {
      console.error("❌ Booking Error:", err);
      res.status(500).json({ error: "Booking failed" });
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                              EMAIL FUNCTION                                 */
/* -------------------------------------------------------------------------- */

async function sendBookingEmail(payload: any) {
  if (!process.env.BOOKING_EMAIL_USER || !process.env.BOOKING_EMAIL_PASS) return;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BOOKING_EMAIL_USER,
        pass: process.env.BOOKING_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `Reboot India <${process.env.BOOKING_EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "📩 New Trek Booking",
      html: `
        <h2>New Trek Booking</h2>
        <p><strong>Trek:</strong> ${payload.trekTitle}</p>
        <p><strong>Name:</strong> ${payload.userName}</p>
        <p><strong>Email:</strong> ${payload.userEmail}</p>
        <p><strong>Phone:</strong> ${payload.userPhone}</p>
        <p><strong>Seats:</strong> ${payload.numberOfSeats}</p>
        <p><strong>Total:</strong> ₹${payload.totalAmount}</p>
      `,
    });
  } catch (err) {
    console.error("❌ Email error:", err);
  }
}
