import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
//import * as schema from "@shared/schema";
import * as schema from "./shared/schema";
import dotenv from "dotenv";
// Load environment variables
dotenv.config();
// ==============================
// ENV VALIDATION
// ==============================
if (!process.env.DATABASE_URL) {
    throw new Error("❌ DATABASE_URL is missing. Please set it in your .env file.");
}
// ==============================
// POSTGRES CONNECTION
// ==============================
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Required for Render, Railway, Supabase, Neon, etc.
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
});
// ==============================
// DRIZZLE INSTANCE
// ==============================
export const db = drizzle(pool, {
    schema,
    logger: process.env.NODE_ENV !== "production",
});
