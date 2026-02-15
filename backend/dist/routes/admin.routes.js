"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const email_1 = require("../lib/email");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "change-me";
const signToken = (id) => jsonwebtoken_1.default.sign({ id }, JWT_SECRET, { expiresIn: "7d" });
const toDate = (value) => {
    if (!value)
        return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
};
const toNumber = (v) => {
    if (v === undefined || v === null || v === "")
        return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
};
const parseJSON = (v) => {
    if (!v)
        return [];
    if (Array.isArray(v))
        return v;
    if (typeof v === "string") {
        try {
            return JSON.parse(v);
        }
        catch {
            return [];
        }
    }
    return [];
};
const slugify = (value) => String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
const parseStringArray = (value) => {
    if (!value)
        return [];
    if (Array.isArray(value))
        return value.map((v) => String(v).trim()).filter(Boolean);
    if (typeof value === "string") {
        return value
            .split(/[,\n]/)
            .map((v) => v.trim())
            .filter(Boolean);
    }
    return [];
};
const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token)
        return res.status(401).json({ error: "Unauthorized" });
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.adminId = payload.id;
        next();
    }
    catch {
        return res.status(401).json({ error: "Unauthorized" });
    }
};
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Missing credentials" });
    let admin = await db_1.prisma.adminUser.findUnique({ where: { email } });
    if (!admin) {
        if (email === process.env.ADMIN_BOOTSTRAP_EMAIL &&
            password === process.env.ADMIN_BOOTSTRAP_PASSWORD) {
            const hash = await bcryptjs_1.default.hash(password, 10);
            admin = await db_1.prisma.adminUser.create({ data: { email, passwordHash: hash } });
        }
        else {
            return res.status(401).json({ error: "Invalid credentials" });
        }
    }
    const valid = await bcryptjs_1.default.compare(password, admin.passwordHash);
    if (!valid)
        return res.status(401).json({ error: "Invalid credentials" });
    return res.json({ token: signToken(admin.id) });
});
router.use(authMiddleware);
router.get("/me", async (req, res) => {
    const admin = await db_1.prisma.adminUser.findUnique({
        where: { id: req.adminId },
        select: { id: true, email: true, name: true, createdAt: true },
    });
    res.json(admin);
});
router.get("/treks", async (_, res) => {
    const treks = await db_1.prisma.trek.findMany({
        include: { departures: true, bookings: true },
        orderBy: { createdAt: "desc" },
    });
    res.json(treks);
});
router.post("/treks", async (req, res) => {
    try {
        const { slug, gallery, itinerary, headerPhotos, morePhotos, contentBlocks, originalPrice, discountedPrice, ...data } = req.body;
        if (!slug)
            return res.status(400).json({ error: "Slug is required" });
        const exists = await db_1.prisma.trek.findUnique({ where: { slug } });
        if (exists)
            return res.status(400).json({ error: "Slug already exists" });
        const trek = await db_1.prisma.trek.create({
            data: {
                slug: String(slug).trim(),
                ...data,
                originalPrice: toNumber(originalPrice),
                discountedPrice: toNumber(discountedPrice),
                gallery: parseJSON(gallery),
                itinerary: parseJSON(itinerary),
                headerPhotos: parseJSON(headerPhotos),
                morePhotos: parseJSON(morePhotos),
                contentBlocks: parseJSON(contentBlocks),
                isActive: data.isActive ?? true,
            },
        });
        res.json(trek);
    }
    catch (err) {
        console.error("Create trek error:", err);
        res.status(500).json({ error: "Failed to create trek" });
    }
});
router.put("/treks/:id", async (req, res) => {
    try {
        // Clone body safely
        const payload = { ...req.body };
        // ----------------------------------
        // Remove relational & read-only fields
        // (Frontend sends full trek object)
        // ----------------------------------
        delete payload.id;
        delete payload.departures;
        delete payload.bookings;
        delete payload.createdAt;
        delete payload.updatedAt;
        const { slug, gallery, itinerary, headerPhotos, morePhotos, contentBlocks, originalPrice, discountedPrice, ...data } = payload;
        // ----------------------------------
        // Check slug uniqueness
        // ----------------------------------
        if (slug) {
            const existing = await db_1.prisma.trek.findFirst({
                where: {
                    slug: String(slug).trim(),
                    NOT: { id: req.params.id },
                },
            });
            if (existing) {
                return res.status(400).json({ error: "Slug already exists" });
            }
        }
        // ----------------------------------
        // Update trek safely
        // ----------------------------------
        const trek = await db_1.prisma.trek.update({
            where: { id: req.params.id },
            data: {
                ...data,
                slug: slug ? String(slug).trim() : undefined,
                originalPrice: originalPrice !== undefined ? toNumber(originalPrice) : undefined,
                discountedPrice: discountedPrice !== undefined ? toNumber(discountedPrice) : undefined,
                gallery: gallery !== undefined ? parseJSON(gallery) : undefined,
                itinerary: itinerary !== undefined ? parseJSON(itinerary) : undefined,
                headerPhotos: headerPhotos !== undefined ? parseJSON(headerPhotos) : undefined,
                morePhotos: morePhotos !== undefined ? parseJSON(morePhotos) : undefined,
                contentBlocks: contentBlocks !== undefined ? parseJSON(contentBlocks) : undefined,
            },
            include: {
                departures: true,
                bookings: true,
            },
        });
        res.json(trek);
    }
    catch (err) {
        console.error("Update trek error:", err);
        res.status(500).json({ error: "Failed to update trek" });
    }
});
router.delete("/treks/:id", async (req, res) => {
    const trek = await db_1.prisma.trek.update({
        where: { id: req.params.id },
        data: { isActive: false },
    });
    res.json(trek);
});
router.post("/treks/:id/departures", async (req, res) => {
    try {
        const departure = await db_1.prisma.departure.create({
            data: {
                trekId: req.params.id,
                startDate: new Date(req.body.startDate),
                endDate: new Date(req.body.endDate),
                totalSeats: Number(req.body.totalSeats),
                pricePerSeat: Number(req.body.pricePerSeat),
            },
        });
        res.json(departure);
    }
    catch {
        res.status(500).json({ error: "Failed to create departure" });
    }
});
router.delete("/departures/:id", async (req, res) => {
    const bookings = await db_1.prisma.booking.count({ where: { departureId: req.params.id } });
    if (bookings > 0) {
        return res.status(400).json({ error: "Cannot delete departure with bookings" });
    }
    const departure = await db_1.prisma.departure.delete({ where: { id: req.params.id } });
    res.json(departure);
});
router.get("/bookings", async (_, res) => {
    const bookings = await db_1.prisma.booking.findMany({
        include: {
            trek: true,
            departure: true,
            customer: true,
            coupon: true,
            payments: true,
        },
        orderBy: { createdAt: "desc" },
    });
    res.json(bookings);
});
router.get("/bookings/pending-full-payment", async (_, res) => {
    const now = new Date();
    const bookings = await db_1.prisma.booking.findMany({
        where: {
            amountDue: { gt: 0 },
            paymentStatus: { in: ["ADVANCE_PAID", "PENDING_ADVANCE"] },
            departure: { startDate: { gte: now } },
        },
        include: { trek: true, departure: true, customer: true },
        orderBy: { departure: { startDate: "asc" } },
    });
    res.json(bookings);
});
router.post("/bookings/:id/send-payment-reminder", async (req, res) => {
    try {
        const booking = await db_1.prisma.booking.findUnique({
            where: { id: req.params.id },
            include: { trek: true, departure: true, customer: true },
        });
        if (!booking)
            return res.status(404).json({ error: "Booking not found" });
        if (booking.amountDue <= 0)
            return res.status(400).json({ error: "No due amount" });
        const paymentLink = `${process.env.FRONTEND_URL || "https://rebootindia.co.in"}/customer/booking?bookingId=${booking.id}`;
        const html = (0, email_1.buildPaymentReminderEmail)({
            customerName: booking.customer.fullName,
            trekTitle: booking.trek.title,
            startDate: new Date(booking.departure.startDate).toDateString(),
            amountDue: booking.amountDue,
            paymentLink,
        });
        await (0, email_1.sendEmail)({
            to: booking.customer.email,
            subject: `Pending Payment Reminder - ${booking.trek.title}`,
            html,
            bookingId: booking.id,
        });
        await db_1.prisma.booking.update({
            where: { id: booking.id },
            data: { dueReminderSentAt: new Date() },
        });
        res.json({ success: true });
    }
    catch (err) {
        console.error("Send payment reminder error:", err);
        res.status(500).json({ error: "Failed to send reminder" });
    }
});
router.post("/bookings/:id/send-welcome-message", async (req, res) => {
    try {
        const { subject, message } = req.body;
        const booking = await db_1.prisma.booking.findUnique({
            where: { id: req.params.id },
            include: { customer: true },
        });
        if (!booking)
            return res.status(404).json({ error: "Booking not found" });
        const html = (0, email_1.buildBatchMessageEmail)({
            customerName: booking.customer.fullName,
            subject: subject || "Welcome to Reboot India Trek",
            message: message ||
                "Your trek starts tomorrow. Please be on time at the pickup point. Vehicle details are attached in this message.",
        });
        await (0, email_1.sendEmail)({
            to: booking.customer.email,
            subject: subject || "Welcome Message - Reboot India",
            html,
            bookingId: booking.id,
        });
        await db_1.prisma.booking.update({
            where: { id: booking.id },
            data: { welcomeSentAt: new Date() },
        });
        res.json({ success: true });
    }
    catch (err) {
        console.error("Send welcome error:", err);
        res.status(500).json({ error: "Failed to send welcome message" });
    }
});
router.get("/departures/:id/manage-batch", async (req, res) => {
    const bookings = await db_1.prisma.booking.findMany({
        where: { departureId: req.params.id, status: { not: "CANCELLED" } },
        include: { customer: true, trek: true, departure: true },
        orderBy: { createdAt: "asc" },
    });
    res.json(bookings);
});
router.post("/departures/:id/manage-batch/send-message", async (req, res) => {
    try {
        const { bookingIds, subject, message } = req.body;
        if (!subject || !message)
            return res.status(400).json({ error: "Subject and message required" });
        const where = { departureId: req.params.id };
        if (Array.isArray(bookingIds) && bookingIds.length > 0)
            where.id = { in: bookingIds };
        const bookings = await db_1.prisma.booking.findMany({
            where,
            include: { customer: true },
        });
        if (!bookings.length)
            return res.status(404).json({ error: "No bookings found in batch" });
        await Promise.all(bookings.map((b) => (0, email_1.sendEmail)({
            to: b.customer.email,
            subject,
            html: (0, email_1.buildBatchMessageEmail)({
                customerName: b.customer.fullName,
                subject,
                message,
            }),
            bookingId: b.id,
        })));
        res.json({ success: true, sent: bookings.length });
    }
    catch (err) {
        console.error("Batch send message error:", err);
        res.status(500).json({ error: "Failed to send message" });
    }
});
router.post("/departures/:id/send-payment-reminders", async (req, res) => {
    try {
        const departure = await db_1.prisma.departure.findUnique({ where: { id: req.params.id } });
        if (!departure)
            return res.status(404).json({ error: "Departure not found" });
        const bookings = await db_1.prisma.booking.findMany({
            where: {
                departureId: req.params.id,
                amountDue: { gt: 0 },
                status: { not: "CANCELLED" },
            },
            include: { customer: true, trek: true, departure: true },
        });
        if (!bookings.length) {
            return res.status(404).json({ error: "No pending-payment bookings found in this batch" });
        }
        await Promise.all(bookings.map(async (booking) => {
            const paymentLink = `${process.env.FRONTEND_URL || "https://rebootindia.co.in"}/customer/booking?bookingId=${booking.id}`;
            const html = (0, email_1.buildPaymentReminderEmail)({
                customerName: booking.customer.fullName,
                trekTitle: booking.trek.title,
                startDate: new Date(booking.departure.startDate).toDateString(),
                amountDue: booking.amountDue,
                paymentLink,
            });
            await (0, email_1.sendEmail)({
                to: booking.customer.email,
                subject: `Pending Payment Reminder - ${booking.trek.title}`,
                html,
                bookingId: booking.id,
            });
            await db_1.prisma.booking.update({
                where: { id: booking.id },
                data: { dueReminderSentAt: new Date() },
            });
        }));
        res.json({ success: true, sent: bookings.length });
    }
    catch (err) {
        console.error("Batch reminder error:", err);
        res.status(500).json({ error: "Failed to send batch payment reminders" });
    }
});
router.get("/customers", async (_, res) => {
    const customers = await db_1.prisma.customer.findMany({
        include: { bookings: true },
        orderBy: { createdAt: "desc" },
    });
    res.json(customers);
});
router.get("/payments", async (_, res) => {
    const payments = await db_1.prisma.payment.findMany({ orderBy: { createdAt: "desc" } });
    res.json(payments);
});
router.get("/trek-blogs", async (req, res) => {
    const { trekId, status, featured } = req.query;
    const blogs = await db_1.prisma.trekBlog.findMany({
        where: {
            ...(trekId ? { trekId } : {}),
            ...(status ? { status: status } : {}),
            ...(featured !== undefined ? { featured: featured === "true" } : {}),
        },
        include: { trek: true },
        orderBy: { updatedAt: "desc" },
    });
    res.json(blogs);
});
router.get("/trek-blogs/by-trek/:trekId", async (req, res) => {
    const blogs = await db_1.prisma.trekBlog.findMany({
        where: { trekId: req.params.trekId },
        include: { trek: true },
        orderBy: { updatedAt: "desc" },
    });
    res.json(blogs);
});
router.get("/trek-blogs/:id", async (req, res) => {
    const blog = await db_1.prisma.trekBlog.findUnique({
        where: { id: req.params.id },
        include: { trek: true },
    });
    if (!blog)
        return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
});
router.get("/trek-blogs/slug/:slug", async (req, res) => {
    const blog = await db_1.prisma.trekBlog.findFirst({
        where: { slug: req.params.slug },
        include: { trek: true },
    });
    if (!blog)
        return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
});
router.post("/trek-blogs", async (req, res) => {
    try {
        const payload = req.body || {};
        if (!payload.trekId)
            return res.status(400).json({ error: "trekId is required" });
        if (!payload.title)
            return res.status(400).json({ error: "title is required" });
        if (!payload.shortIntro)
            return res.status(400).json({ error: "shortIntro is required" });
        if (!payload.content)
            return res.status(400).json({ error: "content is required" });
        let slug = slugify(payload.slug || payload.title);
        if (!slug)
            slug = `blog-${Date.now()}`;
        const exists = await db_1.prisma.trekBlog.findUnique({ where: { slug } });
        if (exists)
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
        const blog = await db_1.prisma.trekBlog.create({
            data: {
                trekId: payload.trekId,
                title: payload.title,
                slug,
                author: payload.author || "Admin",
                status: payload.status || "DRAFT",
                shortIntro: payload.shortIntro,
                content: payload.content,
                personalExperience: payload.personalExperience || null,
                highlights: parseJSON(payload.highlights),
                lessonsLearned: payload.lessonsLearned || null,
                itinerary: parseJSON(payload.itinerary),
                videoUrl: payload.videoUrl || null,
                featuredImage: payload.featuredImage || null,
                gallery: parseJSON(payload.gallery),
                imageAltText: payload.imageAltText || null,
                bestTimeToVisit: payload.bestTimeToVisit || null,
                temperatureRange: payload.temperatureRange || null,
                fitnessLevelRequired: payload.fitnessLevelRequired || null,
                gearList: parseJSON(payload.gearList),
                permitsRequired: Boolean(payload.permitsRequired),
                permitsDescription: payload.permitsDescription || null,
                estimatedCost: payload.estimatedCost || null,
                metaTitle: payload.metaTitle || null,
                metaDescription: payload.metaDescription || null,
                keywords: parseStringArray(payload.keywords),
                openGraphImage: payload.openGraphImage || null,
                publishAt: payload.publishAt ? new Date(payload.publishAt) : null,
                featured: Boolean(payload.featured),
                showOnHomepage: Boolean(payload.showOnHomepage),
            },
            include: { trek: true },
        });
        res.json(blog);
    }
    catch (err) {
        console.error("Create trek blog error:", err);
        res.status(500).json({ error: "Failed to create trek blog" });
    }
});
router.put("/trek-blogs/:id", async (req, res) => {
    try {
        const payload = req.body || {};
        let slug = payload.slug ? slugify(payload.slug) : undefined;
        if (slug) {
            const existing = await db_1.prisma.trekBlog.findFirst({
                where: { slug, NOT: { id: req.params.id } },
            });
            if (existing)
                slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
        const blog = await db_1.prisma.trekBlog.update({
            where: { id: req.params.id },
            data: {
                trekId: payload.trekId,
                title: payload.title,
                slug,
                author: payload.author,
                status: payload.status,
                shortIntro: payload.shortIntro,
                content: payload.content,
                personalExperience: payload.personalExperience,
                highlights: payload.highlights !== undefined ? parseJSON(payload.highlights) : undefined,
                lessonsLearned: payload.lessonsLearned,
                itinerary: payload.itinerary !== undefined ? parseJSON(payload.itinerary) : undefined,
                videoUrl: payload.videoUrl,
                featuredImage: payload.featuredImage,
                gallery: payload.gallery !== undefined ? parseJSON(payload.gallery) : undefined,
                imageAltText: payload.imageAltText,
                bestTimeToVisit: payload.bestTimeToVisit,
                temperatureRange: payload.temperatureRange,
                fitnessLevelRequired: payload.fitnessLevelRequired,
                gearList: payload.gearList !== undefined ? parseJSON(payload.gearList) : undefined,
                permitsRequired: payload.permitsRequired !== undefined ? Boolean(payload.permitsRequired) : undefined,
                permitsDescription: payload.permitsDescription,
                estimatedCost: payload.estimatedCost,
                metaTitle: payload.metaTitle,
                metaDescription: payload.metaDescription,
                keywords: payload.keywords !== undefined ? parseStringArray(payload.keywords) : undefined,
                openGraphImage: payload.openGraphImage,
                publishAt: payload.publishAt !== undefined ? toDate(payload.publishAt) : undefined,
                featured: payload.featured !== undefined ? Boolean(payload.featured) : undefined,
                showOnHomepage: payload.showOnHomepage !== undefined ? Boolean(payload.showOnHomepage) : undefined,
            },
            include: { trek: true },
        });
        res.json(blog);
    }
    catch (err) {
        console.error("Update trek blog error:", err);
        res.status(500).json({ error: "Failed to update trek blog" });
    }
});
router.post("/trek-blogs/:id/status", async (req, res) => {
    const { status } = req.body || {};
    if (!status)
        return res.status(400).json({ error: "status required" });
    const blog = await db_1.prisma.trekBlog.update({
        where: { id: req.params.id },
        data: { status },
    });
    res.json(blog);
});
router.delete("/trek-blogs/:id", async (req, res) => {
    await db_1.prisma.trekBlog.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});
router.get("/trek-reviews", async (req, res) => {
    const { trekId, rating, status, featured } = req.query;
    const reviews = await db_1.prisma.trekReview.findMany({
        where: {
            ...(trekId ? { trekId } : {}),
            ...(rating ? { rating: Number(rating) } : {}),
            ...(status ? { status: status } : {}),
            ...(featured !== undefined ? { featured: featured === "true" } : {}),
        },
        include: { trek: true },
        orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });
    res.json(reviews);
});
router.get("/trek-reviews/by-trek/:trekId", async (req, res) => {
    const reviews = await db_1.prisma.trekReview.findMany({
        where: { trekId: req.params.trekId },
        include: { trek: true },
        orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });
    res.json(reviews);
});
router.post("/trek-reviews", async (req, res) => {
    try {
        const payload = req.body || {};
        if (!payload.trekId)
            return res.status(400).json({ error: "trekId is required" });
        if (!payload.reviewerName)
            return res.status(400).json({ error: "reviewerName is required" });
        if (!payload.reviewText)
            return res.status(400).json({ error: "reviewText is required" });
        const rating = Number(payload.rating);
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "rating should be between 1 and 5" });
        }
        const review = await db_1.prisma.trekReview.create({
            data: {
                trekId: payload.trekId,
                reviewerName: payload.reviewerName,
                reviewerPhotoUrl: payload.reviewerPhotoUrl || null,
                rating,
                reviewTitle: payload.reviewTitle || null,
                reviewText: payload.reviewText,
                trekDate: toDate(payload.trekDate),
                location: payload.location || null,
                recommend: payload.recommend !== undefined ? Boolean(payload.recommend) : true,
                featured: Boolean(payload.featured),
                status: payload.status || "DRAFT",
                displayOrder: payload.displayOrder ? Number(payload.displayOrder) : null,
            },
            include: { trek: true },
        });
        res.json(review);
    }
    catch (err) {
        console.error("Create trek review error:", err);
        res.status(500).json({ error: "Failed to create trek review" });
    }
});
router.put("/trek-reviews/:id", async (req, res) => {
    try {
        const payload = req.body || {};
        const review = await db_1.prisma.trekReview.update({
            where: { id: req.params.id },
            data: {
                trekId: payload.trekId,
                reviewerName: payload.reviewerName,
                reviewerPhotoUrl: payload.reviewerPhotoUrl,
                rating: payload.rating ? Number(payload.rating) : undefined,
                reviewTitle: payload.reviewTitle,
                reviewText: payload.reviewText,
                trekDate: payload.trekDate !== undefined ? toDate(payload.trekDate) : undefined,
                location: payload.location,
                recommend: payload.recommend !== undefined ? Boolean(payload.recommend) : undefined,
                featured: payload.featured !== undefined ? Boolean(payload.featured) : undefined,
                status: payload.status,
                displayOrder: payload.displayOrder !== undefined
                    ? payload.displayOrder === null || payload.displayOrder === ""
                        ? null
                        : Number(payload.displayOrder)
                    : undefined,
            },
            include: { trek: true },
        });
        res.json(review);
    }
    catch (err) {
        console.error("Update trek review error:", err);
        res.status(500).json({ error: "Failed to update trek review" });
    }
});
router.patch("/trek-reviews/:id/status", async (req, res) => {
    const { status } = req.body || {};
    if (!status)
        return res.status(400).json({ error: "status required" });
    const review = await db_1.prisma.trekReview.update({
        where: { id: req.params.id },
        data: { status },
    });
    res.json(review);
});
router.delete("/trek-reviews/:id", async (req, res) => {
    await db_1.prisma.trekReview.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});
router.get("/coupons", async (_, res) => {
    const coupons = await db_1.prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json(coupons);
});
router.post("/coupons", async (req, res) => {
    try {
        const data = req.body;
        const code = String(data.code || "").trim().toUpperCase();
        if (!code)
            return res.status(400).json({ error: "Coupon code required" });
        if (data.value === undefined || data.value === null) {
            return res.status(400).json({ error: "Coupon value required" });
        }
        const exists = await db_1.prisma.coupon.findUnique({ where: { code } });
        if (exists)
            return res.status(400).json({ error: "Coupon already exists" });
        const coupon = await db_1.prisma.coupon.create({
            data: {
                code,
                type: data.type || "PERCENT",
                value: Number(data.value),
                isActive: data.isActive ?? true,
                validFrom: toDate(data.validFrom),
                validTo: toDate(data.validTo),
                maxUses: toNumber(data.maxUses),
                maxUsesPerEmail: toNumber(data.maxUsesPerEmail),
                minAmount: toNumber(data.minAmount),
            },
        });
        res.json(coupon);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create coupon" });
    }
});
router.patch("/coupons/:id", async (req, res) => {
    try {
        const data = req.body;
        const coupon = await db_1.prisma.coupon.update({
            where: { id: req.params.id },
            data: {
                code: data.code ? String(data.code).trim().toUpperCase() : undefined,
                type: data.type,
                value: data.value !== undefined ? Number(data.value) : undefined,
                isActive: data.isActive,
                validFrom: data.validFrom !== undefined ? toDate(data.validFrom) : undefined,
                validTo: data.validTo !== undefined ? toDate(data.validTo) : undefined,
                maxUses: data.maxUses !== undefined ? toNumber(data.maxUses) : undefined,
                maxUsesPerEmail: data.maxUsesPerEmail !== undefined ? toNumber(data.maxUsesPerEmail) : undefined,
                minAmount: data.minAmount !== undefined ? toNumber(data.minAmount) : undefined,
            },
        });
        res.json(coupon);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update coupon" });
    }
});
router.post("/coupons/:id/share", async (req, res) => {
    try {
        const { emails, note } = req.body;
        if (!Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ error: "At least one email is required" });
        }
        const coupon = await db_1.prisma.coupon.findUnique({ where: { id: req.params.id } });
        if (!coupon)
            return res.status(404).json({ error: "Coupon not found" });
        const discountText = coupon.type === "PERCENT" ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`;
        const validTo = coupon.validTo ? new Date(coupon.validTo).toDateString() : undefined;
        const html = (0, email_1.buildCouponShareEmail)({
            couponCode: coupon.code,
            discountText,
            validTo,
            note,
        });
        await Promise.all(emails.map((to) => (0, email_1.sendEmail)({
            to: String(to).trim().toLowerCase(),
            subject: `Coupon ${coupon.code} for your next trek`,
            html,
        })));
        res.json({ success: true, sent: emails.length });
    }
    catch (err) {
        console.error("Coupon share error:", err);
        res.status(500).json({ error: "Failed to share coupon" });
    }
});
router.delete("/coupons/:id", async (req, res) => {
    const coupon = await db_1.prisma.coupon.update({
        where: { id: req.params.id },
        data: { isActive: false },
    });
    res.json(coupon);
});
router.get("/email-logs", async (_, res) => {
    const logs = await db_1.prisma.emailLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
    });
    res.json(logs);
});
router.get("/faqs", async (req, res) => {
    const pageKey = String(req.query.pageKey || "").trim();
    const faqs = await db_1.prisma.pageFaq.findMany({
        where: pageKey ? { pageKey } : undefined,
        orderBy: [{ pageKey: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });
    res.json(faqs);
});
router.post("/faqs", async (req, res) => {
    try {
        const payload = req.body || {};
        const pageKey = String(payload.pageKey || "").trim() || "/";
        const question = String(payload.question || "").trim();
        const answer = String(payload.answer || "").trim();
        if (!question || !answer) {
            return res.status(400).json({ error: "question and answer are required" });
        }
        const faq = await db_1.prisma.pageFaq.create({
            data: {
                pageKey,
                question,
                answer,
                sortOrder: Number(payload.sortOrder || 0),
                isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
            },
        });
        res.json(faq);
    }
    catch (err) {
        console.error("Create faq error:", err);
        res.status(500).json({ error: "Failed to create FAQ" });
    }
});
router.put("/faqs/:id", async (req, res) => {
    try {
        const payload = req.body || {};
        const faq = await db_1.prisma.pageFaq.update({
            where: { id: req.params.id },
            data: {
                pageKey: payload.pageKey !== undefined ? String(payload.pageKey).trim() || "/" : undefined,
                question: payload.question !== undefined ? String(payload.question).trim() : undefined,
                answer: payload.answer !== undefined ? String(payload.answer).trim() : undefined,
                sortOrder: payload.sortOrder !== undefined ? Number(payload.sortOrder || 0) : undefined,
                isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : undefined,
            },
        });
        res.json(faq);
    }
    catch (err) {
        console.error("Update faq error:", err);
        res.status(500).json({ error: "Failed to update FAQ" });
    }
});
router.delete("/faqs/:id", async (req, res) => {
    await db_1.prisma.pageFaq.delete({ where: { id: req.params.id } });
    res.json({ success: true });
});
exports.default = router;
