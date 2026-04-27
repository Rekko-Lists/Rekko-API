-- DropForeignKey
ALTER TABLE "comment" DROP CONSTRAINT "comment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_like_anime" DROP CONSTRAINT "user_like_anime_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "user_like_anime" DROP CONSTRAINT "user_like_anime_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_like_post" DROP CONSTRAINT "user_like_post_post_id_fkey";

-- DropForeignKey
ALTER TABLE "user_like_post" DROP CONSTRAINT "user_like_post_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_rate_anime" DROP CONSTRAINT "user_rate_anime_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "user_rate_anime" DROP CONSTRAINT "user_rate_anime_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_social_account" DROP CONSTRAINT "user_social_account_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_watch_anime" DROP CONSTRAINT "user_watch_anime_anime_id_fkey";

-- DropForeignKey
ALTER TABLE "user_watch_anime" DROP CONSTRAINT "user_watch_anime_user_id_fkey";

-- AlterTable
ALTER TABLE "comment" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "post" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_like_post" ADD CONSTRAINT "user_like_post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_like_post" ADD CONSTRAINT "user_like_post_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_like_anime" ADD CONSTRAINT "user_like_anime_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_like_anime" ADD CONSTRAINT "user_like_anime_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("anime_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rate_anime" ADD CONSTRAINT "user_rate_anime_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rate_anime" ADD CONSTRAINT "user_rate_anime_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("anime_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_watch_anime" ADD CONSTRAINT "user_watch_anime_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_watch_anime" ADD CONSTRAINT "user_watch_anime_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("anime_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_social_account" ADD CONSTRAINT "user_social_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
