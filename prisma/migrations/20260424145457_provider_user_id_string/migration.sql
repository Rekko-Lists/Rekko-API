/*
  Warnings:

  - A unique constraint covering the columns `[provider,provider_user_id]` on the table `oauth_account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "oauth_account_provider_user_id_key";

-- AlterTable
ALTER TABLE "oauth_account" ALTER COLUMN "provider_user_id" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "oauth_account_provider_provider_user_id_key" ON "oauth_account"("provider", "provider_user_id");
