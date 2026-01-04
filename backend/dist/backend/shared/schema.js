"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingSchema = exports.insertBlogSchema = exports.insertTrekSchema = exports.bookings = exports.blogs = exports.treks = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
/* -------------------------------------------------------------------------- */
/*                                   TABLES                                   */
/* -------------------------------------------------------------------------- */
exports.treks = (0, pg_core_1.pgTable)("treks", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    slug: (0, pg_core_1.text)("slug").notNull().unique(),
    title: (0, pg_core_1.text)("title").notNull(),
    duration: (0, pg_core_1.text)("duration").notNull(),
    difficulty: (0, pg_core_1.text)("difficulty").notNull(),
    season: (0, pg_core_1.text)("season").notNull(),
    shortDescription: (0, pg_core_1.text)("short_description").notNull(),
    fullDescription: (0, pg_core_1.text)("full_description").notNull(),
    itinerary: (0, pg_core_1.jsonb)("itinerary").notNull(),
    price: (0, pg_core_1.text)("price").notNull(),
    coverImage: (0, pg_core_1.text)("cover_image").notNull(),
    gallery: (0, pg_core_1.jsonb)("gallery").notNull(),
});
exports.blogs = (0, pg_core_1.pgTable)("blogs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    slug: (0, pg_core_1.text)("slug").notNull().unique(),
    title: (0, pg_core_1.text)("title").notNull(),
    date: (0, pg_core_1.text)("date").notNull(),
    excerpt: (0, pg_core_1.text)("excerpt").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    coverImage: (0, pg_core_1.text)("cover_image").notNull(),
    author: (0, pg_core_1.text)("author").notNull(),
});
exports.bookings = (0, pg_core_1.pgTable)("bookings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    trekSlug: (0, pg_core_1.text)("trek_slug").notNull(),
    trekTitle: (0, pg_core_1.text)("trek_title").notNull(),
    userName: (0, pg_core_1.text)("user_name").notNull(),
    userEmail: (0, pg_core_1.text)("user_email").notNull(),
    userPhone: (0, pg_core_1.text)("user_phone").notNull(),
    numberOfParticipants: (0, pg_core_1.integer)("number_of_participants").notNull(),
    totalPrice: (0, pg_core_1.integer)("total_price").notNull(),
    paymentStatus: (0, pg_core_1.text)("payment_status").default("pending").notNull(),
    stripeSessionId: (0, pg_core_1.text)("stripe_session_id"),
    createdAt: (0, pg_core_1.text)("created_at").notNull(),
});
/* -------------------------------------------------------------------------- */
/*                                   SCHEMAS                                   */
/* -------------------------------------------------------------------------- */
exports.insertTrekSchema = (0, drizzle_zod_1.createInsertSchema)(exports.treks);
exports.insertBlogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.blogs);
exports.createBookingSchema = zod_1.z.object({
    trekSlug: zod_1.z.string().min(1),
    trekTitle: zod_1.z.string().min(1),
    userName: zod_1.z.string().min(1),
    userEmail: zod_1.z.string().email(),
    userPhone: zod_1.z.string().min(10),
    numberOfParticipants: zod_1.z.number().int().min(1),
    totalPrice: zod_1.z.number().int().min(1),
});
