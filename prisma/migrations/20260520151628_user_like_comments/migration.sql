-- CreateTable
CREATE TABLE "user_like_comment" (
    "user_like_comment_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment_id" INTEGER NOT NULL,

    CONSTRAINT "user_like_comment_pkey" PRIMARY KEY ("user_like_comment_id")
);

-- AddForeignKey
ALTER TABLE "user_like_comment" ADD CONSTRAINT "user_like_comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_like_comment" ADD CONSTRAINT "user_like_comment_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comment"("comment_id") ON DELETE CASCADE ON UPDATE CASCADE;
