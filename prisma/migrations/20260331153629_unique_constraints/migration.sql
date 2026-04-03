/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `anime` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[date]` on the table `day` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "anime_name_key" ON "anime"("name");

-- CreateIndex
CREATE UNIQUE INDEX "day_date_key" ON "day"("date");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
