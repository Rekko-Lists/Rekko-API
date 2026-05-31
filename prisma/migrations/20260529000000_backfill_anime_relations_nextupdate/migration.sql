-- Fuerza el stale-refresh para todos los animes que no tienen entradas en
-- anime_relation. Estos animes fueron insertados desde los endpoints de bulk
-- de MAL (ranking/search) donde el campo related_anime se descartaba al
-- persistir. Al poner next_update = NOW() quedan inmediatamente "stale":
-- la próxima vez que alguien visite ese anime, el sistema de refresh en
-- background llamará a MAL por /anime/:id y poblará las relaciones.
UPDATE "anime"
SET "next_update" = NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM "anime_relation"
    WHERE "anime_relation"."anime_id" = "anime"."anime_id"
);
