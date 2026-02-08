import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../db";

const router = Router();
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "change-me";

/* =========================
   HELPERS
========================= */

const signToken = (id: string) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });

const toDate = (value: any) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const toNumber = (v: any) => {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
};

const parseJSON = (v: any) => {
  if (!v) return [];
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return [];
    }
  }
  return v;
};

/* =========================
   AUTH
========================= */

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
   PROFILE
========================= */

router.get("/me", async (req: any, res) => {
  const admin = await prisma.adminUser.findUnique({
    where: { id: req.adminId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  res.json(admin);
});

/* =========================
   TREKS
========================= */

router.get("/treks", async (_, res) => {
  const treks = await prisma.trek.findMany({
    include: { departures: true, bookings: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(treks);
});

router.post("/treks", async (req, res) => {
  try {
    let {
      slug,
      syncDeparturePrices,
      gallery,
      itinerary,
      originalPrice,
      discountedPrice,
      ...data
    } = req.body;

    if (!slug)
      return res.status(400).json({ error: "Slug required" });

    slug = String(slug).trim();

    const exists = await prisma.trek.findUnique({ where: { slug } });
    if (exists)
      return res.status(400).json({ error: "Slug already exists" });

    const trek = await prisma.trek.create({
      data: {
        slug,
        ...data,
        gallery: parseJSON(gallery),
        itinerary: parseJSON(itinerary),
        originalPrice: toNumber(originalPrice),
        discountedPrice: toNumber(discountedPrice),
        isActive: data.isActive ?? true,
      },
    });

    res.json(trek);
  } catch (err) {
    console.error("Create trek error:", err);
    res.status(500).json({ error: "Failed to create trek" });
  }
});

router.put("/treks/:id", async (req, res) => {
  try {
    let {
      slug,
      syncDeparturePrices,
      gallery,
      itinerary,
      originalPrice,
      discountedPrice,
      ...data
    } = req.body;

    if (slug) {
      const existing = await prisma.trek.findFirst({
        where: {
          slug,
          NOT: { id: req.params.id },
        },
      });

      if (existing)
        return res.status(400).json({ error: "Slug already exists" });
    }

    const trek = await prisma.trek.update({
      where: { id: req.params.id },
      data: {
        slug,
        ...data,
        gallery: parseJSON(gallery),
        itinerary: parseJSON(itinerary),
        originalPrice: toNumber(originalPrice),
        discountedPrice: toNumber(discountedPrice),
      },
    });

    // Sync departure prices
    if (syncDeparturePrices) {
      const newPrice =
        toNumber(discountedPrice) || toNumber(originalPrice);

      if (newPrice) {
        await prisma.departure.updateMany({
          where: { trekId: req.params.id },
          data: { pricePerSeat: newPrice },
        });
      }
    }

    res.json(trek);
  } catch (err) {
    console.error("Update trek error:", err);
    res.status(500).json({ error: "Failed to update trek" });
  }
});

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
  try {
    const departure = await prisma.departure.create({
      data: {
        trekId: req.params.id,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        totalSeats: Number(req.body.totalSeats),
        pricePerSeat: Number(req.body.pricePerSeat),
      },
    });
    res.json(departure);
  } catch {
    res.status(500).json({ error: "Failed to create departure" });
  }
});

router.delete("/departures/:id", async (req, res) => {
  const count = await prisma.booking.count({
    where: { departureId: req.params.id },
  });

  if (count > 0)
    return res
      .status(400)
      .json({ error: "Cannot delete departure with bookings" });

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
   COUPONS (FINAL FIX)
========================= */

router.get("/coupons", async (_, res) => {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(coupons);
});

router.post("/coupons", async (req, res) => {
  try {
    const data = req.body;
    const code = String(data.code || "").trim().toUpperCase();

    if (!code)
      return res.status(400).json({ error: "Coupon code required" });

    if (!data.value)
      return res.status(400).json({ error: "Coupon value required" });

    const exists = await prisma.coupon.findUnique({ where: { code } });
    if (exists)
      return res.status(400).json({ error: "Coupon already exists" });

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type: data.type || "PERCENT",
        value: Number(data.value), // REQUIRED number
        isActive: data.isActive ?? true,
        validFrom: toDate(data.validFrom),
        validTo: toDate(data.validTo),
        maxUses: toNumber(data.maxUses),
        maxUsesPerEmail: toNumber(data.maxUsesPerEmail),
        minAmount: toNumber(data.minAmount),
      },
    });

    res.json(coupon);
  } catch (err) {
    console.error("Coupon create error:", err);
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

router.patch("/coupons/:id", async (req, res) => {
  try {
    const data = req.body;

    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: {
        code: data.code
          ? String(data.code).trim().toUpperCase()
          : undefined,
        type: data.type,
        value:
          data.value !== undefined ? Number(data.value) : undefined,
        isActive: data.isActive,
        validFrom:
          data.validFrom !== undefined
            ? toDate(data.validFrom)
            : undefined,
        validTo:
          data.validTo !== undefined
            ? toDate(data.validTo)
            : undefined,
        maxUses:
          data.maxUses !== undefined
            ? toNumber(data.maxUses)
            : undefined,
        maxUsesPerEmail:
          data.maxUsesPerEmail !== undefined
            ? toNumber(data.maxUsesPerEmail)
            : undefined,
        minAmount:
          data.minAmount !== undefined
            ? toNumber(data.minAmount)
            : undefined,
      },
    });

    res.json(coupon);
  } catch (err) {
    console.error("Coupon update error:", err);
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

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
