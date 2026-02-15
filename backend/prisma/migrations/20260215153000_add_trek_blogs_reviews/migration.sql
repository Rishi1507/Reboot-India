CREATE TYPE "TrekBlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED');
CREATE TYPE "TrekReviewStatus" AS ENUM ('DRAFT', 'APPROVED', 'HIDDEN');

ALTER TABLE "Trek" ADD COLUMN "location" TEXT;

CREATE TABLE "TrekBlog" (
  "id" TEXT NOT NULL,
  "trekId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "status" "TrekBlogStatus" NOT NULL DEFAULT 'DRAFT',
  "shortIntro" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "personalExperience" TEXT,
  "highlights" JSONB,
  "lessonsLearned" TEXT,
  "itinerary" JSONB,
  "videoUrl" TEXT,
  "featuredImage" TEXT,
  "gallery" JSONB,
  "imageAltText" TEXT,
  "bestTimeToVisit" TEXT,
  "temperatureRange" TEXT,
  "fitnessLevelRequired" TEXT,
  "gearList" JSONB,
  "permitsRequired" BOOLEAN NOT NULL DEFAULT false,
  "permitsDescription" TEXT,
  "estimatedCost" TEXT,
  "metaTitle" TEXT,
  "metaDescription" TEXT,
  "keywords" JSONB,
  "openGraphImage" TEXT,
  "publishAt" TIMESTAMP(3),
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TrekBlog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrekReview" (
  "id" TEXT NOT NULL,
  "trekId" TEXT NOT NULL,
  "reviewerName" TEXT NOT NULL,
  "reviewerPhotoUrl" TEXT,
  "rating" INTEGER NOT NULL,
  "reviewTitle" TEXT,
  "reviewText" TEXT NOT NULL,
  "trekDate" TIMESTAMP(3),
  "location" TEXT,
  "recommend" BOOLEAN NOT NULL DEFAULT true,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "status" "TrekReviewStatus" NOT NULL DEFAULT 'DRAFT',
  "displayOrder" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TrekReview_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TrekBlog_slug_key" ON "TrekBlog"("slug");
CREATE INDEX "TrekBlog_trekId_idx" ON "TrekBlog"("trekId");
CREATE INDEX "TrekReview_trekId_idx" ON "TrekReview"("trekId");
CREATE INDEX "TrekReview_status_idx" ON "TrekReview"("status");

ALTER TABLE "TrekBlog"
ADD CONSTRAINT "TrekBlog_trekId_fkey"
FOREIGN KEY ("trekId") REFERENCES "Trek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TrekReview"
ADD CONSTRAINT "TrekReview_trekId_fkey"
FOREIGN KEY ("trekId") REFERENCES "Trek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
