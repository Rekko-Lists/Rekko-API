/*
  Warnings:

  - A unique constraint covering the columns `[newEmail]` on the table `email_change_request` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "email_verification_request" (
    "email_verification_request_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_request_pkey" PRIMARY KEY ("email_verification_request_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_request_user_id_key" ON "email_verification_request"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_request_token_key" ON "email_verification_request"("token");

-- CreateIndex
CREATE UNIQUE INDEX "email_change_request_newEmail_key" ON "email_change_request"("newEmail");

-- AddForeignKey
ALTER TABLE "email_verification_request" ADD CONSTRAINT "email_verification_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
