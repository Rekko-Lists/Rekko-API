-- Keep one anime_post row per post/anime before enforcing uniqueness.
DELETE FROM "anime_post" a
USING "anime_post" b
WHERE a."anime_post_id" > b."anime_post_id"
  AND a."anime_id" = b."anime_id"
  AND a."post_id" = b."post_id";

-- Make post/anime edges safe to delete and impossible to duplicate.
ALTER TABLE "anime_post" DROP CONSTRAINT IF EXISTS "anime_post_anime_id_fkey";
ALTER TABLE "anime_post" DROP CONSTRAINT IF EXISTS "anime_post_post_id_fkey";
ALTER TABLE "anime_post" ADD CONSTRAINT "anime_post_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("anime_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "anime_post" ADD CONSTRAINT "anime_post_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "anime_post" ADD CONSTRAINT "anime_post_anime_id_post_id_key" UNIQUE ("anime_id", "post_id");

CREATE TABLE "anime_post_recommendation" (
    "anime_post_recommendation_id" SERIAL NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "related_anime_id" INTEGER NOT NULL,
    "relation_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anime_post_recommendation_pkey" PRIMARY KEY ("anime_post_recommendation_id")
);

ALTER TABLE "anime_post_recommendation" ADD CONSTRAINT "anime_post_recommendation_anime_id_related_anime_id_key" UNIQUE ("anime_id", "related_anime_id");
CREATE INDEX "anime_post_recommendation_anime_id_relation_count_idx" ON "anime_post_recommendation"("anime_id", "relation_count");

ALTER TABLE "anime_post_recommendation" ADD CONSTRAINT "anime_post_recommendation_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("anime_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "anime_post_recommendation" ADD CONSTRAINT "anime_post_recommendation_related_anime_id_fkey" FOREIGN KEY ("related_anime_id") REFERENCES "anime"("anime_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill directed all-vs-all co-occurrences from existing posts.
INSERT INTO "anime_post_recommendation" ("anime_id", "related_anime_id", "relation_count", "updated_at")
SELECT
    ap1."anime_id",
    ap2."anime_id" AS "related_anime_id",
    COUNT(*)::integer AS "relation_count",
    CURRENT_TIMESTAMP AS "updated_at"
FROM "anime_post" ap1
JOIN "anime_post" ap2 ON ap2."post_id" = ap1."post_id"
WHERE ap1."anime_id" <> ap2."anime_id"
GROUP BY ap1."anime_id", ap2."anime_id";

-- Force stale refreshes progressively through catalogue/detail reads so anime_relation is backfilled from MAL.
UPDATE "anime" SET "next_update" = CURRENT_TIMESTAMP;
