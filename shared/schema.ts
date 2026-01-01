import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We define schemas here to ensure consistent types across the app,
// even though we are using static data for this specific project.

export const treks = pgTable("treks", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  duration: text("duration").notNull(),
  difficulty: text("difficulty").notNull(),
  season: text("season").notNull(),
  shortDescription: text("short_description").notNull(),
  fullDescription: text("full_description").notNull(),
  itinerary: jsonb("itinerary").notNull(), // Array of { day: number, title: string, desc: string }
  price: text("price").notNull(),
  coverImage: text("cover_image").notNull(),
  gallery: jsonb("gallery").notNull(), // Array of strings
});

export const blogs = pgTable("blogs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(), // Markdown content
  coverImage: text("cover_image").notNull(),
  author: text("author").notNull(),
});

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
});

export const insertTrekSchema = createInsertSchema(treks);
export const insertBlogSchema = createInsertSchema(blogs);
export const createBookingSchema = z.object({
  trekSlug: z.string().min(1),
  trekTitle: z.string().min(1),
  userName: z.string().min(1),
  userEmail: z.string().email(),
  userPhone: z.string().min(10),
  numberOfParticipants: z.number().int().min(1),
  totalPrice: z.number().int().min(1),
});

export type Trek = typeof treks.$inferSelect;
export type InsertTrek = z.infer<typeof insertTrekSchema>;

export type Blog = typeof blogs.$inferSelect;
export type InsertBlog = z.infer<typeof insertBlogSchema>;

export type Booking = typeof bookings.$inferSelect;
export type CreateBookingRequest = z.infer<typeof createBookingSchema>;
