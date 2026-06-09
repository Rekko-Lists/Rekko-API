-- Garantiza que no puede existir más de un challenge del mismo tipo en el mismo día.
-- Previene race conditions en la creación de challenges diarios.
ALTER TABLE "challenge" ADD CONSTRAINT "challenge_day_id_type_id_key" UNIQUE ("day_id", "type_id");
