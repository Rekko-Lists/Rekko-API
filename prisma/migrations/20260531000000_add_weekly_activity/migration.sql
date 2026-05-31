ALTER TABLE "user_like_post" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "user_like_anime" ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "anime_weekly_activity" (
    "anime_weekly_activity_id" SERIAL NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "week_start" TIMESTAMP(3) NOT NULL,
    "post_count" INTEGER NOT NULL DEFAULT 0,
    "anime_like_count" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "anime_weekly_activity_pkey" PRIMARY KEY ("anime_weekly_activity_id")
);

CREATE UNIQUE INDEX "anime_weekly_activity_anime_id_week_start_key" ON "anime_weekly_activity"("anime_id", "week_start");
CREATE INDEX "anime_weekly_activity_week_start_score_idx" ON "anime_weekly_activity"("week_start", "score");

ALTER TABLE "anime_weekly_activity" ADD CONSTRAINT "anime_weekly_activity_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("anime_id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "anime_weekly_activity" ("anime_id", "week_start", "post_count", "score")
SELECT
    ap."anime_id",
    date_trunc('week', p."created_at")::timestamp AS "week_start",
    COUNT(*)::int AS "post_count",
    (COUNT(*)::int * 4) AS "score"
FROM "anime_post" ap
JOIN "post" p ON p."post_id" = ap."post_id"
GROUP BY ap."anime_id", date_trunc('week', p."created_at")
ON CONFLICT ("anime_id", "week_start") DO UPDATE SET
    "post_count" = "anime_weekly_activity"."post_count" + EXCLUDED."post_count",
    "score" = (("anime_weekly_activity"."post_count" + EXCLUDED."post_count") * 4) + "anime_weekly_activity"."anime_like_count";

INSERT INTO "anime_weekly_activity" ("anime_id", "week_start", "anime_like_count", "score")
SELECT
    "anime_id",
    date_trunc('week', "created_at")::timestamp AS "week_start",
    COUNT(*)::int AS "anime_like_count",
    COUNT(*)::int AS "score"
FROM "user_like_anime"
GROUP BY "anime_id", date_trunc('week', "created_at")
ON CONFLICT ("anime_id", "week_start") DO UPDATE SET
    "anime_like_count" = "anime_weekly_activity"."anime_like_count" + EXCLUDED."anime_like_count",
    "score" = ("anime_weekly_activity"."post_count" * 4) + "anime_weekly_activity"."anime_like_count" + EXCLUDED."anime_like_count";
