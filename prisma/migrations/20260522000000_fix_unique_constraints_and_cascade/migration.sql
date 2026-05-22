-- Add unique constraints to prevent duplicate likes/ratings/watch entries
ALTER TABLE "user_like_post" ADD CONSTRAINT "user_like_post_user_id_post_id_key" UNIQUE ("user_id", "post_id");
ALTER TABLE "user_like_comment" ADD CONSTRAINT "user_like_comment_user_id_comment_id_key" UNIQUE ("user_id", "comment_id");
ALTER TABLE "user_like_anime" ADD CONSTRAINT "user_like_anime_user_id_anime_id_key" UNIQUE ("user_id", "anime_id");
ALTER TABLE "user_rate_anime" ADD CONSTRAINT "user_rate_anime_user_id_anime_id_key" UNIQUE ("user_id", "anime_id");
ALTER TABLE "user_watch_anime" ADD CONSTRAINT "user_watch_anime_user_id_anime_id_key" UNIQUE ("user_id", "anime_id");

-- Add CASCADE to comment self-referential FK so deleting a comment deletes its replies
ALTER TABLE "comment" DROP CONSTRAINT IF EXISTS "comment_parent_comment_id_fkey";
ALTER TABLE "comment" ADD CONSTRAINT "comment_parent_comment_id_fkey"
  FOREIGN KEY ("parent_comment_id") REFERENCES "comment"("comment_id")
  ON DELETE CASCADE ON UPDATE CASCADE;
