import { Router } from "express";
import { prisma } from "../db";

const router = Router();

function isValidEmail(value: string) {
  const v = String(value || "").trim().toLowerCase();
  return Boolean(v) && v.includes("@") && v.length <= 254;
}

router.post("/contact", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const message = String(req.body?.message || "").trim();

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!isValidEmail(email)) return res.status(400).json({ error: "Valid email is required" });
    if (!message) return res.status(400).json({ error: "Message is required" });

    const saved = await prisma.contactMessage.create({
      data: { name, email, message },
    });

    return res.json({ success: true, id: saved.id });
  } catch (err) {
    console.error("Contact message error:", err);
    return res.status(500).json({ error: "Failed to submit message" });
  }
});

router.post("/newsletter/subscribe", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const sourcePath = req.body?.sourcePath ? String(req.body.sourcePath).trim() : null;

    if (!isValidEmail(email)) return res.status(400).json({ error: "Valid email is required" });

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { sourcePath: sourcePath || undefined },
      create: { email, sourcePath },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return res.status(500).json({ error: "Failed to subscribe" });
  }
});

export default router;

