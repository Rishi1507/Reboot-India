import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import cors from "cors";
import "dotenv/config";

const app = express();
const httpServer = createServer(app);

// ==============================
// MIDDLEWARE
// ==============================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "1mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: true }));

// ==============================
// LOGGER
// ==============================
export function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  console.log(`${time} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} ${Date.now() - start}ms`);
    }
  });

  next();
});

// ==============================
// BOOTSTRAP SERVER
// ==============================
(async () => {
  try {
    // ✅ REGISTER ALL API ROUTES
    await registerRoutes(httpServer, app);

    // Health check
    app.get("/health", (_req, res) => {
      res.json({ status: "ok" });
    });

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error("❌ API Error:", err);
      res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
      });
    });

    // ==============================
    // DEV vs PROD
    // ==============================
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // ==============================
    // START SERVER
    // ==============================
    const PORT = Number(process.env.PORT) || 5000;

    httpServer.listen(PORT, "0.0.0.0", () => {
      log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("🔥 Failed to start server:", err);
    process.exit(1);
  }
})();
