/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `social_account` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "social_account_name_key" ON "social_account"("name");
