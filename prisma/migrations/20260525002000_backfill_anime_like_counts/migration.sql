-- Repair anime like counters from the source-of-truth like table.
UPDATE "anime" a
SET "likes" = COALESCE(counts."likes", 0)
FROM (
    SELECT "anime_id", COUNT(*)::integer AS "likes"
    FROM "user_like_anime"
    GROUP BY "anime_id"
) counts
WHERE a."anime_id" = counts."anime_id";

UPDATE "anime" a
SET "likes" = 0
WHERE NOT EXISTS (
    SELECT 1
    FROM "user_like_anime" ula
    WHERE ula."anime_id" = a."anime_id"
);
