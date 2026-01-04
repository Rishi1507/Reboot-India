import type { Express, Request, Response } from "express";
import nodemailer from "nodemailer";

// Node 18+ (Node 20 on Railway) has native fetch

export async function registerRoutes(_db: any, app: Express) {
  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      console.log("📥 Booking request received");

      const {
        trekTitle,
        userName,
        userEmail,
        userPhone,
        numberOfParticipants,
        totalPrice,
      } = req.body;

      // --------------------
      // VALIDATION
      // --------------------
      if (!userName || !userEmail || !userPhone || !trekTitle) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const bookingPayload = {
        trekTitle,
        userName,
        userEmail,
        userPhone,
        numberOfParticipants,
        totalPrice,
        createdAt: new Date().toISOString(),
      };

      // ✅ RESPOND IMMEDIATELY (CRITICAL FIX)
      res.json({
        success: true,
        message: "Booking received",
      });

      // 🔁 BACKGROUND TASKS (NON-BLOCKING)
      Promise.allSettled([
        sendToGoogleSheets(bookingPayload),
        sendBookingEmail(bookingPayload),
      ]);
    } catch (error) {
      console.error("❌ Booking Error:", error);
      res.status(500).json({ error: "Booking failed" });
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                               */
/* -------------------------------------------------------------------------- */

async function sendToGoogleSheets(payload: any) {
  if (!process.env.GOOGLE_SHEETS_WEBHOOK) {
    console.warn("⚠️ GOOGLE_SHEETS_WEBHOOK not set");
    return;
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), 5000); // ⏱ 5s timeout

  try {
    const response = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Sheets responded with ${response.status}`);
    }

    console.log("✅ Google Sheets updated");
  } catch (err) {
    console.error("❌ Google Sheets error:", err);
  }
}

async function sendBookingEmail(payload: any) {
  if (!process.env.BOOKING_EMAIL_USER || !process.env.BOOKING_EMAIL_PASS) {
    console.warn("⚠️ Email credentials not set");
    return;
  }

  try {
    // ✅ RAILWAY-SAFE SMTP CONFIG
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // IMPORTANT for Railway
      auth: {
        user: process.env.BOOKING_EMAIL_USER,
        pass: process.env.BOOKING_EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
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
        <p><strong>Participants:</strong> ${payload.numberOfParticipants}</p>
        <p><strong>Total:</strong> ₹${payload.totalPrice}</p>
      `,
    });

    console.log("✅ Email sent");
  } catch (err) {
    console.error("❌ Email error:", err);
  }
}
