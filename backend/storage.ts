import {
  type Trek,
  type Blog,
  type Booking,
  type CreateBookingRequest,
  bookings,
} from "./shared/schema";

import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getTreks(): Promise<Trek[]>;
  createBooking(
    booking: CreateBookingRequest & {
      paymentStatus: string;
      createdAt: string;
    }
  ): Promise<Booking>;
  updateBooking(id: number, updates: Partial<Booking>): Promise<Booking>;
}

export class DatabaseStorage implements IStorage {
  async getTreks(): Promise<Trek[]> {
    // implement later if needed
    return [];
  }

  async createBooking(
    booking: CreateBookingRequest & {
      paymentStatus: string;
      createdAt: string;
    }
  ): Promise<Booking> {
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

  async updateBooking(
    id: number,
    updates: Partial<Booking>
  ): Promise<Booking> {
    const [updated] = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();

    return updated;
  }
}

export const storage = new DatabaseStorage();
