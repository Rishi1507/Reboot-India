"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    try {
        const { trekId, departureId, numberOfSeats, seats, numberOfParticipants, userName, userEmail, userPhone, couponCode, } = req.body;
        /* -------------------- NORMALIZE SEATS -------------------- */
        const rawSeats = numberOfSeats ??
            seats ??
            numberOfParticipants;
        const seatsCount = typeof rawSeats === "number"
            ? rawSeats
            : typeof rawSeats === "string"
                ? parseInt(rawSeats.trim(), 10)
                : NaN;
        /* -------------------- VALIDATION -------------------- */
        if (!trekId || !departureId) {
            return res.status(400).json({ error: "Invalid trekId or departureId" });
        }
        if (!userName || !userEmail || !userPhone) {
            return res.status(400).json({ error: "Missing customer details" });
        }
        if (!Number.isInteger(seatsCount) || seatsCount <= 0) {
            return res.status(400).json({ error: "Invalid numberOfSeats" });
        }
        /* -------------------- FETCH DEPARTURE -------------------- */
        const departure = await db_1.prisma.departure.findUnique({
            where: { id: departureId },
        });
        if (!departure) {
            return res.status(404).json({ error: "Departure not found" });
        }
        const totalAmount = seatsCount * departure.pricePerSeat;
        const discountAmount = 0;
        const finalAmount = totalAmount;
        /* -------------------- UPSERT CUSTOMER -------------------- */
        const customer = await db_1.prisma.customer.upsert({
            where: { email: userEmail.toLowerCase() },
            update: {
                fullName: userName.trim(),
                phone: userPhone.trim(),
            },
            create: {
                fullName: userName.trim(),
                email: userEmail.toLowerCase(),
                phone: userPhone.trim(),
            },
        });
        /* -------------------- CREATE BOOKING -------------------- */
        const booking = await db_1.prisma.booking.create({
            data: {
                trek: { connect: { id: trekId } },
                departure: { connect: { id: departureId } },
                customer: { connect: { id: customer.id } },
                numberOfSeats: seatsCount,
                totalAmount,
                discountAmount,
                finalAmount,
                status: "PENDING",
                // ❌ DO NOT send couponId directly
                ...(couponCode && {
                    coupon: {
                        connect: { code: couponCode.trim().toUpperCase() },
                    },
                }),
            },
        });
        return res.json({
            success: true,
            bookingId: booking.id,
            finalAmount,
            status: booking.status,
        });
    }
    catch (error) {
        console.error("Booking creation error:", error);
        return res.status(500).json({ error: "Failed to create booking" });
    }
});
exports.default = router;
