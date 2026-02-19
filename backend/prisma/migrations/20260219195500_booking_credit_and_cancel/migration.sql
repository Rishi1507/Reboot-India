-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "creditBalance" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "creditUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "creditGranted" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cancelledAt" TIMESTAMP(3);

