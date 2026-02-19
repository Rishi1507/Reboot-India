-- CreateTable
CREATE TABLE "AdminLoginOtp" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLoginOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminLoginOtp_adminUserId_idx" ON "AdminLoginOtp"("adminUserId");

-- CreateIndex
CREATE INDEX "AdminLoginOtp_expiresAt_idx" ON "AdminLoginOtp"("expiresAt");

-- AddForeignKey
ALTER TABLE "AdminLoginOtp" ADD CONSTRAINT "AdminLoginOtp_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

