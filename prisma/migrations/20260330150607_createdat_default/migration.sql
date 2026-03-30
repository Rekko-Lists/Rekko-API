-- AlterTable
ALTER TABLE "refresh_token" ALTER COLUMN "created_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "created_at" DROP DEFAULT;
