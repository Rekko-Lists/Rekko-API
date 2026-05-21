/*
  Warnings:

  - You are about to drop the column `rank` on the `anime` table. All the data in the column will be lost.
  - You are about to alter the column `rate` on the `user_rate_anime` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Changed the type of `state` on the `user_watch_anime` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AnimeState" AS ENUM ('COMPLETED', 'WATCHING', 'ON_HOLD', 'DROPPED', 'PLAN_TO_WATCH');

-- AlterTable
ALTER TABLE "anime" DROP COLUMN "rank";

-- AlterTable
ALTER TABLE "user_rate_anime" ALTER COLUMN "rate" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "user_watch_anime" DROP COLUMN "state",
ADD COLUMN     "state" "AnimeState" NOT NULL;
