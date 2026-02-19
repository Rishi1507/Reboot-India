"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const trek_routes_1 = __importDefault(require("./routes/trek.routes"));
const coupon_routes_1 = __importDefault(require("./routes/coupon.routes"));
const faq_routes_1 = __importDefault(require("./routes/faq.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const db_1 = require("./db");
const email_1 = require("./lib/email");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
// Admin can upload images as data URLs (base64) in trek blogs/reviews. Those payloads can be large.
app.use(express_1.default.json({ limit: "250mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "250mb" }));
app.use(health_routes_1.default);
app.use("/api/bookings", booking_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/payment", payment_routes_1.default);
app.use("/api/treks", trek_routes_1.default);
app.use("/api/coupons", coupon_routes_1.default);
app.use("/api/faqs", faq_routes_1.default);
app.use("/api", public_routes_1.default);
async function runBookingAutomations() {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dueBookings = await db_1.prisma.booking.findMany({
        where: {
            amountDue: { gt: 0 },
            dueReminderSentAt: null,
            departure: { startDate: { gte: now, lte: twoDaysFromNow } },
        },
        include: { customer: true, trek: true, departure: true },
    });
    await Promise.all(dueBookings.map(async (booking) => {
        const html = (0, email_1.buildPaymentReminderEmail)({
            customerName: booking.customer.fullName,
            trekTitle: booking.trek.title,
            startDate: new Date(booking.departure.startDate).toDateString(),
            amountDue: booking.amountDue,
            paymentLink: `${process.env.FRONTEND_URL || "https://rebootindia.co.in"}/customer/booking?bookingId=${booking.id}`,
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
    }));
    const welcomeBookings = await db_1.prisma.booking.findMany({
        where: {
            welcomeSentAt: null,
            departure: { startDate: { gte: now, lte: oneDayFromNow } },
            status: "CONFIRMED",
        },
        include: { customer: true, trek: true, departure: true },
    });
    await Promise.all(welcomeBookings.map(async (booking) => {
        const html = (0, email_1.buildBatchMessageEmail)({
            customerName: booking.customer.fullName,
            subject: `Welcome to ${booking.trek.title}`,
            message: "Your trek begins tomorrow. Please keep your ID proof and essentials ready. Vehicle details will be shared by your trek coordinator.",
        });
        await (0, email_1.sendEmail)({
            to: booking.customer.email,
            subject: `Welcome - ${booking.trek.title}`,
            html,
            bookingId: booking.id,
        });
        await db_1.prisma.booking.update({
            where: { id: booking.id },
            data: { welcomeSentAt: new Date() },
        });
    }));
}
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    if (process.env.ENABLE_BOOKING_AUTOMATION !== "false") {
        runBookingAutomations().catch((err) => console.error("Initial automation run failed:", err));
        setInterval(() => {
            runBookingAutomations().catch((err) => console.error("Automation run failed:", err));
        }, 6 * 60 * 60 * 1000);
    }
});
