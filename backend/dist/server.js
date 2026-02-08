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
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(health_routes_1.default);
app.use("/api/bookings", booking_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/payment", payment_routes_1.default);
app.use("/api/treks", trek_routes_1.default);
app.use("/api/coupons", coupon_routes_1.default);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});
