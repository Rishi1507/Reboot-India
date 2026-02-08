import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../db";

const router = Router();

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "change-me";

/* =========================
   AUTH
========================= */

const signToken = (id: string) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });

const authMiddleware = async (req: any, res: any, next: any) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.adminId = payload.id;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" });

  let admin = await prisma.adminUser.findUnique({ where: { email } });

  // Bootstrap admin
  if (!admin) {
    if (
      email === process.env.ADMIN_BOOTSTRAP_EMAIL &&
      password === process.env.ADMIN_BOOTSTRAP_PASSWORD
    ) {
      const hash = await bcrypt.hash(password, 10);
      admin = await prisma.adminUser.create({
        data: { email, passwordHash: hash },
      });
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ token: signToken(admin.id) });
});

router.use(authMiddleware);

/* =========================
   ADMIN PROFILE
========================= */

router.get("/me", async (req: any, res) => {
  const admin = await prisma.adminUser.findUnique({
    where: { id: req.adminId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  res.json(admin);
});

/* =========================
   TREKS (FIXED)
========================= */

router.get("/treks", async (_, res) => {
  const treks = await prisma.trek.findMany({
    where: { isActive: true },
    include: {
      departures: true,   // ✅ REQUIRED for Departures tab
      bookings: true,     // ✅ REQUIRED for delete safety + summary
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(treks);
});

router.post("/treks", async (req, res) => {
  const {
    id,
    createdAt,
    departures,
    bookings,
    coupon,
    payment,
    redemptions,
    syncDeparturePrices,
    ...data
  } = req.body || {};

  const trek = await prisma.trek.create({ data });
  res.json(trek);
});

router.put("/treks/:id", async (req, res) => {
  const {
    id,
    createdAt,
    departures,
    bookings,
    coupon,
    payment,
    redemptions,
    syncDeparturePrices,
    ...data
  } = req.body || {};

  const updated = await prisma.trek.update({
    where: { id: req.params.id },
    data,
  });

  // Sync prices to departures
  if (
    syncDeparturePrices &&
    (data.discountedPrice || data.originalPrice || data.price)
  ) {
    let newPrice = data.discountedPrice || data.originalPrice;
    if (!newPrice && data.price) {
      const digits = String(data.price).replace(/[^0-9]/g, "");
      newPrice = digits ? Number(digits) : undefined;
    }

    if (newPrice) {
      await prisma.departure.updateMany({
        where: { trekId: req.params.id },
        data: { pricePerSeat: Number(newPrice) },
      });
    }
  }

  res.json(updated);
});

// ✅ Soft delete trek (frontend already prevents unsafe delete)
router.delete("/treks/:id", async (req, res) => {
  const trek = await prisma.trek.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  res.json(trek);
});

/* =========================
   DEPARTURES
========================= */

router.post("/treks/:id/departures", async (req, res) => {
  const departure = await prisma.departure.create({
    data: { ...req.body, trekId: req.params.id },
  });
  res.json(departure);
});

router.patch("/departures/:id", async (req, res) => {
  const departure = await prisma.departure.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(departure);
});

router.delete("/departures/:id", async (req, res) => {
  const departure = await prisma.departure.delete({
    where: { id: req.params.id },
  });
  res.json(departure);
});

/* =========================
   BOOKINGS
========================= */

router.get("/bookings", async (_, res) => {
  const bookings = await prisma.booking.findMany({
    include: {
      trek: true,
      departure: true,
      customer: true,
      coupon: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(bookings);
});

router.patch("/bookings/:id", async (req, res) => {
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(booking);
});

/* =========================
   CUSTOMERS
========================= */

router.get("/customers", async (_, res) => {
  const customers = await prisma.customer.findMany({
    include: { bookings: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(customers);
});

/* =========================
   PAYMENTS
========================= */

router.get("/payments", async (_, res) => {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(payments);
});

/* =========================
   COUPONS
========================= */

router.get("/coupons", async (_, res) => {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(coupons);
});

router.post("/coupons", async (req, res) => {
  const data = req.body;
  const coupon = await prisma.coupon.create({
    data: {
      ...data,
      code: String(data.code || "").trim().toUpperCase(),
    },
  });
  res.json(coupon);
});

router.patch("/coupons/:id", async (req, res) => {
  const data = req.body;
  const coupon = await prisma.coupon.update({
    where: { id: req.params.id },
    data: {
      ...data,
      code: data.code
        ? String(data.code).trim().toUpperCase()
        : undefined,
    },
  });
  res.json(coupon);
});

// Soft delete coupon
router.delete("/coupons/:id", async (req, res) => {
  const coupon = await prisma.coupon.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  res.json(coupon);
});

/* =========================
   EMAIL LOGS
========================= */

router.get("/email-logs", async (_, res) => {
  const logs = await prisma.emailLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json(logs);
});

export default router;
