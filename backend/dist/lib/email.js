"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.buildAdvanceBookingEmail = buildAdvanceBookingEmail;
exports.buildPaymentReminderEmail = buildPaymentReminderEmail;
exports.buildBatchMessageEmail = buildBatchMessageEmail;
exports.buildCouponShareEmail = buildCouponShareEmail;
exports.buildAdminOtpEmail = buildAdminOtpEmail;
exports.buildBookingCancellationEmail = buildBookingCancellationEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_1 = require("../db");
let transporter = null;
function getTransporter() {
    if (transporter)
        return transporter;
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;
    transporter = nodemailer_1.default.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
            user: process.env.BOOKING_EMAIL_USER,
            pass: process.env.BOOKING_EMAIL_PASS,
        },
    });
    return transporter;
}
async function sendEmail({ to, subject, html, bookingId }) {
    if (!process.env.BOOKING_EMAIL_USER || !process.env.BOOKING_EMAIL_PASS) {
        console.error("Email skipped: BOOKING_EMAIL_USER/BOOKING_EMAIL_PASS are missing");
        await db_1.prisma.emailLog.create({
            data: {
                to,
                subject,
                status: "FAILED",
                error: "Email credentials are not configured",
                bookingId,
            },
        });
        return;
    }
    try {
        const smtp = getTransporter();
        const fromEmail = process.env.MAIL_FROM || process.env.BOOKING_EMAIL_USER;
        await smtp.sendMail({
            from: `Reboot India <${fromEmail}>`,
            to,
            subject,
            html,
        });
        await db_1.prisma.emailLog.create({
            data: { to, subject, status: "SENT", bookingId },
        });
    }
    catch (err) {
        console.error("Email send failed:", err);
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
function buildAdvanceBookingEmail(payload) {
    const { customerName, trekkingId, trekTitle, startDate, endDate, seats, totalAmount, advancePaid, amountDue, } = payload;
    return `
  <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
      <div style="background:#5d2a2c;color:#fff;padding:20px 24px;">
        <h1 style="margin:0;font-size:22px;">Reboot India</h1>
        <p style="margin:6px 0 0;">Booking Confirmed (Pay at Trek)</p>
      </div>
      <div style="padding:24px;">
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>Your seat is confirmed. You paid advance and the balance can be paid before/at trek start.</p>
        <div style="background:#f9fafb;border:1px solid #eee;border-radius:10px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;"><strong>Trekking ID:</strong> ${trekkingId}</p>
          <p style="margin:0 0 8px;"><strong>Trek:</strong> ${trekTitle}</p>
          <p style="margin:0 0 8px;"><strong>Dates:</strong> ${startDate} - ${endDate}</p>
          <p style="margin:0 0 8px;"><strong>Seats:</strong> ${seats}</p>
          <p style="margin:0 0 8px;"><strong>Total:</strong> ₹${totalAmount}</p>
          <p style="margin:0 0 8px;"><strong>Advance Paid:</strong> ₹${advancePaid}</p>
          <p style="margin:0;"><strong>Pending Amount:</strong> ₹${amountDue}</p>
        </div>
        <p>Use your Trekking ID for support and booking lookup.</p>
      </div>
    </div>
  </div>
  `;
}
function buildPaymentReminderEmail(payload) {
    const { customerName, trekTitle, startDate, amountDue, paymentLink } = payload;
    return `
  <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #eee;">
      <div style="padding:24px;">
        <h2 style="margin-top:0;">Payment Reminder</h2>
        <p>Hi <strong>${customerName}</strong>,</p>
        <p>Your <strong>${trekTitle}</strong> batch starts on <strong>${startDate}</strong>.</p>
        <p>Pending amount: <strong>₹${amountDue}</strong></p>
        <p><a href="${paymentLink}" style="background:#5d2a2c;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;display:inline-block;">Pay Pending Amount</a></p>
      </div>
    </div>
  </div>
  `;
}
function buildBatchMessageEmail(payload) {
    return `
  <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #eee;padding:24px;">
      <p>Hi <strong>${payload.customerName}</strong>,</p>
      <h3>${payload.subject}</h3>
      <p style="white-space:pre-line;">${payload.message}</p>
      <p>Team Reboot India</p>
    </div>
  </div>
  `;
}
function buildCouponShareEmail(payload) {
    return `
  <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #eee;padding:24px;">
      <h2>Special Trek Coupon for You</h2>
      <p>Use code <strong>${payload.couponCode}</strong> to get <strong>${payload.discountText}</strong>.</p>
      ${payload.validTo ? `<p>Valid till: <strong>${payload.validTo}</strong></p>` : ""}
      ${Array.isArray(payload.terms) && payload.terms.length
        ? `<div style="margin:12px 0 0;"><strong>Terms:</strong><ul style="margin:8px 0 0;padding-left:18px;">${payload.terms
            .map((t) => `<li>${t}</li>`)
            .join("")}</ul></div>`
        : ""}
      <div style="margin-top:12px;">
        <strong>How to use:</strong>
        <ol style="margin:8px 0 0;padding-left:18px;">
          <li>Select your trek batch and proceed to booking.</li>
          <li>Enter the coupon code in the booking screen and click Apply.</li>
          <li>Pay the advance to confirm your seats. Discount reflects in total/final amount.</li>
        </ol>
      </div>
      ${payload.note ? `<p style="white-space:pre-line;margin-top:12px;"><strong>Note:</strong><br/>${payload.note}</p>` : ""}
      <p style="margin-top:12px;">Book now at rebootindia.co.in</p>
    </div>
  </div>
  `;
}
function buildAdminOtpEmail(payload) {
    return `
  <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #eee;padding:24px;">
      <h2 style="margin-top:0;">Admin Login OTP</h2>
      <p>Your Reboot India admin login OTP is:</p>
      <div style="font-size:28px;letter-spacing:6px;font-weight:700;background:#f9fafb;border:1px solid #eee;border-radius:10px;padding:14px 16px;display:inline-block;">
        ${payload.otp}
      </div>
      <p style="margin-top:16px;">This code expires in ${payload.expiresMinutes} minutes.</p>
      <p style="color:#666;font-size:12px;margin-top:16px;">
        If you did not request this OTP, you can ignore this email.
      </p>
    </div>
  </div>
  `;
}
function buildBookingCancellationEmail(payload) {
    return `
  <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #eee;overflow:hidden;">
      <div style="background:#5d2a2c;color:#fff;padding:20px 24px;">
        <h1 style="margin:0;font-size:20px;">Booking Cancelled</h1>
      </div>
      <div style="padding:24px;">
        <p>Hi <strong>${payload.customerName}</strong>,</p>
        <p>Your booking for <strong>${payload.trekTitle}</strong> has been cancelled.</p>
        <div style="background:#f9fafb;border:1px solid #eee;border-radius:10px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 8px;"><strong>Trekking ID:</strong> ${payload.trekkingId}</p>
          <p style="margin:0 0 8px;"><strong>Start Date:</strong> ${payload.startDate}</p>
          <p style="margin:0;"><strong>Seats:</strong> ${payload.seats}</p>
        </div>
        <p style="margin:0 0 8px;">
          As per policy, the advance payment is <strong>not refunded</strong> but can be used as credit for your next trek.
        </p>
        <p style="margin:0 0 8px;"><strong>Credit added:</strong> â‚¹${payload.creditGranted}</p>
        <p style="margin:0;"><strong>Your available credit:</strong> â‚¹${payload.creditBalance}</p>
        <p style="color:#666;font-size:12px;margin-top:16px;">
          This credit will be automatically adjusted against your pending amount on your next booking.
        </p>
      </div>
    </div>
  </div>
  `;
}
