"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
//const prisma = new PrismaClient();
const db_1 = require("../db");
/**
 * GET /api/treks
 * Returns all treks with departures
 */
router.get("/", async (_req, res) => {
    try {
        const treks = await db_1.prisma.trek.findMany({
            where: { isActive: true },
            include: { departures: true },
        });
        res.json(treks);
    }
    catch (err) {
        console.error("TREK LIST ERROR:", err);
        res.status(500).json({ error: "Failed to load treks" });
    }
});
/**
 * GET /api/treks/:slug
 * Returns a single trek by slug
 */
router.get("/:slug", async (req, res) => {
    try {
        // 🔍 DEBUG BLOCK (remove later)
        console.log("Looking for slug:", req.params.slug);
        const count = await db_1.prisma.trek.count();
        console.log("TREK COUNT IN API DB:", count);
        // 🔍 END DEBUG BLOCK
        const trek = await db_1.prisma.trek.findFirst({
            where: { slug: req.params.slug, isActive: true },
            include: { departures: true },
        });
        if (!trek) {
            console.warn("❌ Trek not found for slug:", req.params.slug);
            return res.status(404).json({ error: "Trek not found" });
        }
        res.json(trek);
    }
    catch (err) {
        console.error("TREK DETAIL ERROR:", err);
        res.status(500).json({ error: "Failed to load trek" });
    }
});
exports.default = router;
