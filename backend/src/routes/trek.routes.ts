import { Router } from "express";

const router = Router();
import { prisma } from "../db";


/**
 * GET /api/treks
 * Returns all treks with departures
 */
router.get("/", async (_req, res) => {
  try {
    const treks = await prisma.trek.findMany({
      where: { isActive: true },
      include: { departures: true },
    });
    res.json(treks);
  } catch (err) {
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
    const trek = await prisma.trek.findFirst({
      where: { slug: req.params.slug, isActive: true },
      include: { departures: true },
    });

    if (!trek) {
      return res.status(404).json({ error: "Trek not found" });
    }

    res.json(trek);
  } catch (err) {
    console.error("TREK DETAIL ERROR:", err);
    res.status(500).json({ error: "Failed to load trek" });
  }
});

router.get("/:slug/blogs", async (req, res) => {
  try {
    const trek = await prisma.trek.findFirst({
      where: { slug: req.params.slug, isActive: true },
      select: { id: true },
    });
    if (!trek) return res.status(404).json({ error: "Trek not found" });

    const blogs = await prisma.trekBlog.findMany({
      where: { trekId: trek.id, status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        shortIntro: true,
        featuredImage: true,
        publishAt: true,
        createdAt: true,
      },
      orderBy: [{ publishAt: "desc" }, { createdAt: "desc" }],
    });

    res.json({ blogs });
  } catch (err) {
    console.error("TREK BLOGS ERROR:", err);
    res.status(500).json({ error: "Failed to load trek blogs" });
  }
});

router.get("/:slug/reviews", async (req, res) => {
  try {
    const trek = await prisma.trek.findFirst({
      where: { slug: req.params.slug, isActive: true },
      select: { id: true },
    });
    if (!trek) return res.status(404).json({ error: "Trek not found" });

    const reviews = await prisma.trekReview.findMany({
      where: { trekId: trek.id, status: "APPROVED" },
      orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? Number(
            (reviews.reduce((acc, cur) => acc + (cur.rating || 0), 0) / totalReviews).toFixed(1),
          )
        : 0;

    res.json({
      totalReviews,
      avgRating,
      reviews,
    });
  } catch (err) {
    console.error("TREK REVIEWS ERROR:", err);
    res.status(500).json({ error: "Failed to load trek reviews" });
  }
});

router.get("/:trekSlug/blogs/:blogSlug", async (req, res) => {
  try {
    const trek = await prisma.trek.findFirst({
      where: { slug: req.params.trekSlug, isActive: true },
      select: { id: true, title: true, slug: true, difficulty: true, location: true },
    });
    if (!trek) return res.status(404).json({ error: "Trek not found" });

    const blog = await prisma.trekBlog.findFirst({
      where: {
        trekId: trek.id,
        slug: req.params.blogSlug,
        status: "PUBLISHED",
      },
    });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.json({ trek, blog });
  } catch (err) {
    console.error("TREK BLOG DETAIL ERROR:", err);
    res.status(500).json({ error: "Failed to load trek blog" });
  }
});

export default router;
