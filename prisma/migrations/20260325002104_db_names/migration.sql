-- AlterTable
ALTER TABLE "user" ADD COLUMN     "biography" TEXT,
ADD COLUMN     "reputation" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "social_account" (
    "social_account_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "social_account_pkey" PRIMARY KEY ("social_account_id")
);

-- CreateTable
CREATE TABLE "user_social_account" (
    "user_social_account_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "social_account_id" INTEGER NOT NULL,
    "social_url" TEXT NOT NULL,

    CONSTRAINT "user_social_account_pkey" PRIMARY KEY ("user_social_account_id")
);

-- AddForeignKey
ALTER TABLE "user_social_account" ADD CONSTRAINT "user_social_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_social_account" ADD CONSTRAINT "user_social_account_social_account_id_fkey" FOREIGN KEY ("social_account_id") REFERENCES "social_account"("social_account_id") ON DELETE RESTRICT ON UPDATE CASCADE;
