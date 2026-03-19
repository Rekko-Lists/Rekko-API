-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateTable
CREATE TABLE "refresh_token" (
    "refresh_token_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3) NOT NULL,
    "user_agent" TEXT NOT NULL,
    "ip" TEXT NOT NULL,

    CONSTRAINT "refresh_token_pkey" PRIMARY KEY ("refresh_token_id")
);

-- CreateTable
CREATE TABLE "oauth_account" (
    "oauth_account_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider_user_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,

    CONSTRAINT "oauth_account_pkey" PRIMARY KEY ("oauth_account_id")
);

-- CreateTable
CREATE TABLE "comment" (
    "comment_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,
    "parent_comment_id" INTEGER,
    "message" TEXT NOT NULL,
    "likes" INTEGER NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "user" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profile_image" TEXT NOT NULL,
    "banner_image" TEXT,
    "background_image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "post" (
    "post_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "photo" TEXT,
    "likes" INTEGER NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "anime" (
    "anime_id" SERIAL NOT NULL,
    "mal_id" INTEGER NOT NULL,
    "broadcast_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "synopsis" TEXT NOT NULL,
    "img_medium" TEXT NOT NULL,
    "img_large" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "mal_mean" DOUBLE PRECISION NOT NULL,
    "mal_rank" INTEGER NOT NULL,
    "mean" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "num_episodes" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "next_update" TIMESTAMP(3) NOT NULL,
    "likes" INTEGER NOT NULL,
    "genres" TEXT[],
    "studios" TEXT[],

    CONSTRAINT "anime_pkey" PRIMARY KEY ("anime_id")
);

-- CreateTable
CREATE TABLE "broadcast" (
    "broadcast_id" SERIAL NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,

    CONSTRAINT "broadcast_pkey" PRIMARY KEY ("broadcast_id")
);

-- CreateTable
CREATE TABLE "challenge" (
    "challenge_id" SERIAL NOT NULL,
    "type_id" INTEGER NOT NULL,
    "day_id" INTEGER NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "challenge_pkey" PRIMARY KEY ("challenge_id")
);

-- CreateTable
CREATE TABLE "type" (
    "type_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "type_pkey" PRIMARY KEY ("type_id")
);

-- CreateTable
CREATE TABLE "day" (
    "day_id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "day_pkey" PRIMARY KEY ("day_id")
);

-- CreateTable
CREATE TABLE "user_like_post" (
    "user_like_post_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,

    CONSTRAINT "user_like_post_pkey" PRIMARY KEY ("user_like_post_id")
);

-- CreateTable
CREATE TABLE "anime_post" (
    "anime_post_id" SERIAL NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,

    CONSTRAINT "anime_post_pkey" PRIMARY KEY ("anime_post_id")
);

-- CreateTable
CREATE TABLE "user_like_anime" (
    "user_like_anime_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "anime_id" INTEGER NOT NULL,

    CONSTRAINT "user_like_anime_pkey" PRIMARY KEY ("user_like_anime_id")
);

-- CreateTable
CREATE TABLE "user_rate_anime" (
    "user_rate_anime_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "user_rate_anime_pkey" PRIMARY KEY ("user_rate_anime_id")
);

-- CreateTable
CREATE TABLE "user_watch_anime" (
    "user_watch_anime_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "num_episodes" INTEGER NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "user_watch_anime_pkey" PRIMARY KEY ("user_watch_anime_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_account_provider_user_id_key" ON "oauth_account"("provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "anime_mal_id_key" ON "anime"("mal_id");

-- CreateIndex
CREATE UNIQUE INDEX "anime_broadcast_id_key" ON "anime"("broadcast_id");

-- AddForeignKey
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_account" ADD CONSTRAINT "oauth_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comment"("comment_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime" ADD CONSTRAINT "anime_broadcast_id_fkey" FOREIGN KEY ("broadcast_id") REFERENCES "broadcast"("broadcast_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "type"("type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "day"("day_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("anime_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_like_post" ADD CONSTRAINT "user_like_post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_like_post" ADD CONSTRAINT "user_like_post_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_post" ADD CONSTRAINT "anime_post_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("anime_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_post" ADD CONSTRAINT "anime_post_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_like_anime" ADD CONSTRAINT "user_like_anime_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_like_anime" ADD CONSTRAINT "user_like_anime_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("anime_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rate_anime" ADD CONSTRAINT "user_rate_anime_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rate_anime" ADD CONSTRAINT "user_rate_anime_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("anime_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_watch_anime" ADD CONSTRAINT "user_watch_anime_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_watch_anime" ADD CONSTRAINT "user_watch_anime_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("anime_id") ON DELETE RESTRICT ON UPDATE CASCADE;
