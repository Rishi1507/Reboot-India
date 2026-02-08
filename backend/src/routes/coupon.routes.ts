import { Router } from "express";
import { prisma } from "../db";

const router = Router();

router.post("/validate", async (req, res) => {
  try {
    const { departureId, seats, couponCode } = req.body;

    if (!departureId || !seats || !couponCode) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const departure = await prisma.departure.findUnique({
      where: { id: departureId },
    });

    if (!departure) {
      return res.status(404).json({ error: "Departure not found" });
    }

    const totalAmount = Number(seats) * departure.pricePerSeat;
    const now = new Date();
    const coupon = await prisma.coupon.findUnique({
      where: { code: String(couponCode).trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ error: "Invalid coupon" });
    }

    if (coupon.validFrom && now < coupon.validFrom) {
      return res.status(400).json({ error: "Coupon not active yet" });
    }

    if (coupon.validTo && now > coupon.validTo) {
      return res.status(400).json({ error: "Coupon has expired" });
    }

    if (coupon.minAmount && totalAmount < coupon.minAmount) {
      return res
        .status(400)
        .json({ error: "Coupon not applicable for this amount" });
    }

    let discountAmount = 0;
    if (coupon.type === "PERCENT") {
      discountAmount = Math.floor((totalAmount * coupon.value) / 100);
    } else {
      discountAmount = coupon.value;
    }

    if (discountAmount > totalAmount) {
      discountAmount = totalAmount;
    }

    const finalAmount = totalAmount - discountAmount;

    return res.json({
      success: true,
      totalAmount,
      discountAmount,
      finalAmount,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to validate coupon" });
  }
});

export default router;
