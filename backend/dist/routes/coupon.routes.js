"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.post("/validate", async (req, res) => {
    try {
        const { departureId, seats, couponCode } = req.body;
        if (!departureId || !seats || !couponCode) {
            return res.status(400).json({ error: "departureId, seats and couponCode are required" });
        }
        const [departure, coupon] = await Promise.all([
            db_1.prisma.departure.findUnique({ where: { id: departureId } }),
            db_1.prisma.coupon.findUnique({
                where: { code: String(couponCode).trim().toUpperCase() },
            }),
        ]);
        if (!departure)
            return res.status(404).json({ error: "Departure not found" });
        if (!coupon || !coupon.isActive)
            return res.status(400).json({ error: "Invalid coupon" });
        const now = new Date();
        if (coupon.validFrom && now < coupon.validFrom) {
            return res.status(400).json({ error: "Coupon not active yet" });
        }
        if (coupon.validTo && now > coupon.validTo) {
            return res.status(400).json({ error: "Coupon expired" });
        }
        const seatCount = Number(seats);
        if (!Number.isInteger(seatCount) || seatCount <= 0) {
            return res.status(400).json({ error: "Invalid seats count" });
        }
        const totalAmount = seatCount * departure.pricePerSeat;
        if (coupon.minAmount && totalAmount < coupon.minAmount) {
            return res.status(400).json({ error: `Min booking amount is ₹${coupon.minAmount}` });
        }
        const discountAmount = coupon.type === "PERCENT"
            ? Math.floor((totalAmount * coupon.value) / 100)
            : coupon.value;
        const normalizedDiscount = Math.min(discountAmount, totalAmount);
        const finalAmount = totalAmount - normalizedDiscount;
        return res.json({
            success: true,
            totalAmount,
            discountAmount: normalizedDiscount,
            finalAmount,
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
            },
        });
    }
    catch (err) {
        console.error("Coupon validate error:", err);
        return res.status(500).json({ error: "Failed to validate coupon" });
    }
});
exports.default = router;
