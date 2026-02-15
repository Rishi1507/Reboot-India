CREATE TABLE "PageFaq" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageFaq_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PageFaq_pageKey_isActive_sortOrder_idx" ON "PageFaq"("pageKey", "isActive", "sortOrder");
