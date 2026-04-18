/*
  Warnings:

  - Added the required column `updated_at` to the `email_change_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `email_verification_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `password_change_request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email_change_request" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "email_verification_request" ADD COLUMN     "confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "password_change_request" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
