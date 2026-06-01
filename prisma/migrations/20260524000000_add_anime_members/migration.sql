-- Add members counter to anime (increments when a user adds the anime to their list)
ALTER TABLE "anime" ADD COLUMN "members" INTEGER NOT NULL DEFAULT 0;
