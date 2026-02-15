-- Trek content enhancements
ALTER TABLE "Trek"
ADD COLUMN "headerPhotos" JSONB,
ADD COLUMN "morePhotos" JSONB,
ADD COLUMN "contentBlocks" JSONB;

-- Booking lifecycle enhancements
CREATE TYPE "BookingPaymentStatus" AS ENUM ('PENDING_ADVANCE', 'ADVANCE_PAID', 'FULLY_PAID');

ALTER TABLE "Booking"
ADD COLUMN "trekkingId" TEXT,
ADD COLUMN "amountPaid" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "amountDue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "advanceAmount" INTEGER NOT NULL DEFAULT 500,
ADD COLUMN "fullPaymentDiscountPercent" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN "paymentStatus" "BookingPaymentStatus" NOT NULL DEFAULT 'PENDING_ADVANCE',
ADD COLUMN "dueReminderSentAt" TIMESTAMP(3),
ADD COLUMN "welcomeSentAt" TIMESTAMP(3);

UPDATE "Booking"
SET "trekkingId" = CONCAT('TRK-', UPPER(SUBSTRING(REPLACE("id"::text, '-', '') FROM 1 FOR 8)))
WHERE "trekkingId" IS NULL;

ALTER TABLE "Booking"
ALTER COLUMN "trekkingId" SET NOT NULL;

CREATE UNIQUE INDEX "Booking_trekkingId_key" ON "Booking"("trekkingId");

-- Allow multiple payment rows per booking (advance + due)
DROP INDEX IF EXISTS "Payment_bookingId_key";
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");

ALTER TABLE "Payment"
ADD COLUMN "stage" TEXT NOT NULL DEFAULT 'ADVANCE';
