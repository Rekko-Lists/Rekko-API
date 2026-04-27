/*
  Warnings:

  - You are about to drop the column `access_token` on the `oauth_account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "oauth_account" DROP COLUMN "access_token";
