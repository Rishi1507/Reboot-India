"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = require("./routes");
const db_1 = require("./db");
// ==============================
// LOAD ENV VARIABLES
// ==============================
dotenv_1.default.config();
// ==============================
// INIT APP
// ==============================
const app = (0, express_1.default)();
// ==============================
// MIDDLEWARE
// ==============================
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
// ==============================
// ROUTES
// ==============================
(0, routes_1.registerRoutes)(db_1.db, app);
// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
// ==============================
// ERROR HANDLER
// ==============================
app.use((err, _req, res, _next) => {
    console.error("❌ API Error:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
    });
});
// ==============================
// START SERVER
// ==============================
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});
