import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

/* -------------------------------------------------------------------------- */
/*                                   TABLES                                   */
/* -------------------------------------------------------------------------- */

export const treks = pgTable("treks", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  duration: text("duration").notNull(),
  difficulty: text("difficulty").notNull(),
  season: text("season").notNull(),
  shortDescription: text("short_description").notNull(),
  fullDescription: text("full_description").notNull(),
  itinerary: jsonb("itinerary").notNull(),
  price: text("price").notNull(),
  coverImage: text("cover_image").notNull(),
  gallery: jsonb("gallery").notNull(),
})

export const blogs = pgTable("blogs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image").notNull(),
  author: text("author").notNull(),
})

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  trekSlug: text("trek_slug").notNull(),
  trekTitle: text("trek_title").notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  userPhone: text("user_phone").notNull(),
  numberOfParticipants: integer("number_of_participants").notNull(),
  totalPrice: integer("total_price").notNull(),
  paymentStatus: text("payment_status").default("pending").notNull(),
  stripeSessionId: text("stripe_session_id"),
  createdAt: text("created_at").notNull(),
})

/* -------------------------------------------------------------------------- */
/*                                   SCHEMAS                                   */
/* -------------------------------------------------------------------------- */

export const insertTrekSchema = createInsertSchema(treks)
export const insertBlogSchema = createInsertSchema(blogs)

export const createBookingSchema = z.object({
  trekSlug: z.string().min(1),
  trekTitle: z.string().min(1),
  userName: z.string().min(1),
  userEmail: z.string().email(),
  userPhone: z.string().min(10),
  numberOfParticipants: z.number().int().min(1),
  totalPrice: z.number().int().min(1),
})

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                    */
/* -------------------------------------------------------------------------- */

// ❗ Infer the server insert input types from Drizzle ORM, not from Zod
export type InsertTrek = typeof treks.$inferInsert
export type InsertBlog = typeof blogs.$inferInsert

// Zod-based validated request type
export type CreateBookingRequest = z.infer<typeof createBookingSchema>

// Use the $inferSelect types for fetch results
export type Trek = typeof treks.$inferSelect
export type Blog = typeof blogs.$inferSelect
export type Booking = typeof bookings.$inferSelect
