-- Keep one link per user/social network before enforcing uniqueness.
DELETE FROM "user_social_account" a
USING "user_social_account" b
WHERE a."user_social_account_id" > b."user_social_account_id"
  AND a."user_id" = b."user_id"
  AND a."social_account_id" = b."social_account_id";

ALTER TABLE "user_social_account" ADD CONSTRAINT "user_social_account_user_id_social_account_id_key" UNIQUE ("user_id", "social_account_id");
