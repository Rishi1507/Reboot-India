import fetch from "node-fetch";
import nodemailer from "nodemailer";
export async function registerRoutes(_server, app) {
    // ==============================
    // BOOKINGS API
    // ==============================
    app.post("/api/bookings", async (req, res) => {
        try {
            const { trekTitle, userName, userEmail, userPhone, numberOfParticipants, totalPrice, } = req.body;
            // --------------------
            // VALIDATION
            // --------------------
            if (!userName || !userEmail || !userPhone || !trekTitle) {
                return res.status(400).json({
                    error: "Missing required fields",
                });
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
            // --------------------
            // 1️⃣ GOOGLE SHEETS
            // --------------------
            const sheetResponse = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bookingPayload),
            });
            if (!sheetResponse.ok) {
                throw new Error("Failed to write to Google Sheet");
            }
            // --------------------
            // 2️⃣ EMAIL NOTIFICATION
            // --------------------
            const transporter = nodemailer.createTransport({
                service: "gmail",
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
          <h2>New Trek Booking Received</h2>
          <p><strong>Trek:</strong> ${trekTitle}</p>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Phone:</strong> ${userPhone}</p>
          <p><strong>Participants:</strong> ${numberOfParticipants}</p>
          <p><strong>Total Amount:</strong> ₹${totalPrice}</p>
        `,
            });
            // --------------------
            // SUCCESS
            // --------------------
            res.json({
                success: true,
                message: "Booking successful",
            });
        }
        catch (error) {
            console.error("❌ Booking Error:", error);
            res.status(500).json({
                error: "Booking failed",
            });
        }
    });
}
