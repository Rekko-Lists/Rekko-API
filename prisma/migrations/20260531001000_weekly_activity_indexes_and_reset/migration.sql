TRUNCATE TABLE "anime_weekly_activity";

CREATE INDEX "user_reputation_idx" ON "user"("reputation");
CREATE INDEX "user_like_post_created_at_post_id_idx" ON "user_like_post"("created_at", "post_id");
CREATE INDEX "user_like_anime_created_at_anime_id_idx" ON "user_like_anime"("created_at", "anime_id");
