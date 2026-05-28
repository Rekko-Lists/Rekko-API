/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `type` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `name` on the `type` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TypeName" AS ENUM ('ANIME', 'CHARACTER', 'OPENING', 'EMOJI');

-- AlterTable
ALTER TABLE "type" DROP COLUMN "name",
ADD COLUMN     "name" "TypeName" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "type_name_key" ON "type"("name");

-- Seed required challenge types.
INSERT INTO "type" ("type_id", "name")
VALUES
    (1, 'ANIME'),
    (2, 'CHARACTER'),
    (3, 'OPENING'),
    (4, 'EMOJI')
ON CONFLICT ("name") DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('"type"', 'type_id'),
    COALESCE((SELECT MAX("type_id") FROM "type"), 1)
);
