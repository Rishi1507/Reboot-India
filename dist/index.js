import express from "express";
import cors from "cors";
import "dotenv/config";
import { registerRoutes } from "./routes";
const app = express();
// ==============================
// MIDDLEWARE
// ==============================
app.use(cors({
    origin: [
        "http://localhost:5173", // local dev
        "https://your-vercel-app.vercel.app" // replace later
    ],
    credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
// ==============================
// ROUTES
// ==============================
registerRoutes(null, app);
// Health check (Render needs this)
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
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});
