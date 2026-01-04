import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { registerRoutes } from "./routes";
import { db } from "./db";

// ==============================
// LOAD ENV VARIABLES
// ==============================
dotenv.config();

// ==============================
// INIT APP
// ==============================
const app = express();

// ==============================
// MIDDLEWARE
// ==============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ==============================
// ROUTES
// ==============================
registerRoutes(db, app);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// ==============================
// ERROR HANDLER
// ==============================
app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("❌ API Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
    });
  }
);

// ==============================
// START SERVER
// ==============================
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
