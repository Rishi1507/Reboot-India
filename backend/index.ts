import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { registerRoutes } from "./routes";
import { db } from "./db";

/* ==============================
   LOAD ENV VARIABLES
================================ */
dotenv.config();

/* ==============================
   INIT APP
================================ */
const app = express();

/* ==============================
   CORS (🔥 FIXED)
   MUST be BEFORE routes
================================ */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL, // Netlify domain
    ].filter(Boolean) as string[],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* ==============================
   BODY PARSERS
================================ */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* ==============================
   ROUTES
================================ */
registerRoutes(db, app);

/* ==============================
   HEALTH CHECK
================================ */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

/* ==============================
   ERROR HANDLER
================================ */
app.use(
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("❌ API Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
    });
  }
);

/* ==============================
   START SERVER
================================ */
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
