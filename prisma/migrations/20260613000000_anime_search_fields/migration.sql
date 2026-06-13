-- Alternative titles + normalized search field for tolerant anime search.
ALTER TABLE "anime" ADD COLUMN "title_english" TEXT;
ALTER TABLE "anime" ADD COLUMN "title_synonyms" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "anime" ADD COLUMN "search_text" TEXT NOT NULL DEFAULT '';

-- Trigram fuzzy matching on the normalized search field.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "anime_search_text_trgm_idx"
    ON "anime" USING GIN ("search_text" gin_trgm_ops);

-- Immediate backfill for existing rows: normalize the primary name
-- (lowercase, strip every non-alphanumeric char) so spacing variants match
-- right after deploy. English/synonyms fill in as animes refresh from MAL.
UPDATE "anime"
SET "search_text" = regexp_replace(lower("name"), '[^a-z0-9]+', '', 'g');
