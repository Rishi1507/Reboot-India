"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.buildBookingEmail = buildBookingEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_1 = require("../db");
async function sendEmail({ to, subject, html, bookingId, }) {
    if (!process.env.BOOKING_EMAIL_USER || !process.env.BOOKING_EMAIL_PASS) {
        return;
    }
    try {
        const transporter = nodemailer_1.default.createTransport({
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
            to,
            subject,
            html,
        });
        await db_1.prisma.emailLog.create({
            data: { to, subject, status: "SENT", bookingId },
        });
    }
    catch (err) {
        await db_1.prisma.emailLog.create({
            data: {
                to,
                subject,
                status: "FAILED",
                error: err?.message || "Email error",
                bookingId,
            },
        });
    }
}
function buildBookingEmail({ customerName, trekTitle, startDate, endDate, seats, totalAmount, discountAmount, finalAmount, }) {
    return `
  <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
      <div style="background:#5d2a2c;color:#fff;padding:20px 24px;">
        <h1 style="margin:0;font-size:22px;">Reboot India</h1>
        <p style="margin:6px 0 0;">Booking Confirmation</p>
      </div>
      <div style="padding:24px;">
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>Your trek booking is confirmed. We’re excited to host you!</p>
        <div style="background:#f9fafb;border:1px solid #eee;border-radius:10px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;"><strong>Trek:</strong> ${trekTitle}</p>
          <p style="margin:0 0 8px;"><strong>Dates:</strong> ${startDate} - ${endDate}</p>
          <p style="margin:0 0 8px;"><strong>Seats:</strong> ${seats}</p>
          <p style="margin:0 0 8px;"><strong>Total:</strong> ₹${totalAmount}</p>
          <p style="margin:0 0 8px;"><strong>Discount:</strong> ₹${discountAmount}</p>
          <p style="margin:0;"><strong>Paid:</strong> ₹${finalAmount}</p>
        </div>
        <p>If you have questions, reply to this email.</p>
        <p>— Team Reboot India</p>
      </div>
    </div>
  </div>
  `;
}
