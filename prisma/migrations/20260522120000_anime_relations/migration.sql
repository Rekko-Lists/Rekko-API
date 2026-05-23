-- CreateTable
CREATE TABLE "anime_relation" (
    "anime_relation_id" SERIAL NOT NULL,
    "anime_id" INTEGER NOT NULL,
    "related_mal_id" INTEGER NOT NULL,
    "related_anime_id" INTEGER,
    "relation_type" TEXT NOT NULL,
    "relation_label" TEXT NOT NULL,
    "related_title" TEXT NOT NULL,
    "related_image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anime_relation_pkey" PRIMARY KEY ("anime_relation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "anime_relation_anime_id_related_mal_id_key" ON "anime_relation"("anime_id", "related_mal_id");

-- AddForeignKey
ALTER TABLE "anime_relation" ADD CONSTRAINT "anime_relation_anime_id_fkey" FOREIGN KEY ("anime_id") REFERENCES "anime"("anime_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anime_relation" ADD CONSTRAINT "anime_relation_related_anime_id_fkey" FOREIGN KEY ("related_anime_id") REFERENCES "anime"("anime_id") ON DELETE SET NULL ON UPDATE CASCADE;
