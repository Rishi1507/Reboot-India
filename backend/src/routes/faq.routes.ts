import { Router } from "express";
import { prisma } from "../db";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rawPage = String(req.query.page || "").trim();
    const pageKey = rawPage || "/";

    const faqs = await prisma.pageFaq.findMany({
      where: {
        isActive: true,
        OR: [{ pageKey }, { pageKey: "*" }],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    res.json(faqs);
  } catch (err) {
    console.error("FAQ fetch error:", err);
    res.status(500).json({ error: "Failed to load FAQs" });
  }
});

export default router;
