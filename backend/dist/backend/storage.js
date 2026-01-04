"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
const schema_1 = require("./shared/schema");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
class DatabaseStorage {
    async getTreks() {
        // implement later if needed
        return [];
    }
    async createBooking(booking) {
        const [newBooking] = await db_1.db
            .insert(schema_1.bookings)
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
        const [updated] = await db_1.db
            .update(schema_1.bookings)
            .set(updates)
            .where((0, drizzle_orm_1.eq)(schema_1.bookings.id, id))
            .returning();
        return updated;
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
