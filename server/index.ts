import express from "express";
import cors from "cors";
import "dotenv/config";
import { registerRoutes } from "./routes";

const app = express();

// ==============================
// MIDDLEWARE
// ==============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL || ""
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ==============================
// ROUTES
// ==============================
registerRoutes(null, app);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ==============================
// ERROR HANDLER
// ==============================
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("❌ API Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ==============================
// START SERVER (Railway compatible)
// ==============================
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
