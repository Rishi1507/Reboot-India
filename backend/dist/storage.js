import { db } from "./db";
import { bookings } from "@shared/schema";
import { eq } from "drizzle-orm";
export class DatabaseStorage {
    async getTreks() {
        return [];
    }
    async createBooking(booking) {
        const [newBooking] = await db
            .insert(bookings)
            .values({
            trekSlug: booking.trekSlug,
            trekTitle: booking.trekTitle,
            userName: booking.userName,
            userEmail: booking.userEmail,
            userPhone: booking.userPhone,
            numberOfParticipants: booking.numberOfParticipants,
            totalPrice: booking.totalPrice,
            paymentStatus: booking.paymentStatus,
            createdAt: booking.createdAt,
        })
            .returning();
        return newBooking;
    }
    async updateBooking(id, updates) {
        const [updated] = await db
            .update(bookings)
            .set(updates)
            .where(eq(bookings.id, id))
            .returning();
        return updated;
    }
}
export const storage = new DatabaseStorage();
