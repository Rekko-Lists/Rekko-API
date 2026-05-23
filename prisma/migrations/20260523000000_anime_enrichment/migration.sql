-- Add enrichment fields to anime entity for detail view
ALTER TABLE "anime" ADD COLUMN "duration" INTEGER;
ALTER TABLE "anime" ADD COLUMN "premiered_season" TEXT;
ALTER TABLE "anime" ADD COLUMN "premiered_year" INTEGER;
ALTER TABLE "anime" ADD COLUMN "rating" TEXT;
