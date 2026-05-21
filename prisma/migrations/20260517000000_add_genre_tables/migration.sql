-- CreateTable
CREATE TABLE "genre" (
    "genre_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genre_pkey" PRIMARY KEY ("genre_id")
);

-- CreateTable
CREATE TABLE "anime_genre" (
    "anime_genre_id" SERIAL NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "genre_id" INTEGER NOT NULL,

    CONSTRAINT "anime_genre_pkey" PRIMARY KEY ("anime_genre_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "genre_name_key" ON "genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "anime_genre_anime_id_genre_id_key" ON "anime_genre"("anime_id", "genre_id");

-- AddForeignKey
ALTER TABLE "anime_genre" ADD CONSTRAINT "anime_genre_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("anime_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_genre" ADD CONSTRAINT "anime_genre_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genre"("genre_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing genre data from anime.genres String[] to normalized tables
INSERT INTO "genre" ("name")
SELECT DISTINCT unnest("genres") AS "name"
FROM "anime"
WHERE "genres" IS NOT NULL AND array_length("genres", 1) > 0
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "anime_genre" ("anime_id", "genre_id")
SELECT a."anime_id", g."genre_id"
FROM "anime" a
CROSS JOIN LATERAL unnest(a."genres") AS genre_name
JOIN "genre" g ON g."name" = genre_name
WHERE a."genres" IS NOT NULL AND array_length(a."genres", 1) > 0;

-- AlterTable: drop old genres column
ALTER TABLE "anime" DROP COLUMN "genres";
