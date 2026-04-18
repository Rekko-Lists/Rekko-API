-- CreateTable
CREATE TABLE "email_change_request" (
    "email_change_request_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "newEmail" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_change_request_pkey" PRIMARY KEY ("email_change_request_id")
);

-- CreateTable
CREATE TABLE "password_change_request" (
    "password_change_request_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_change_request_pkey" PRIMARY KEY ("password_change_request_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_change_request_user_id_key" ON "email_change_request"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_change_request_token_key" ON "email_change_request"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_change_request_user_id_key" ON "password_change_request"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_change_request_token_key" ON "password_change_request"("token");

-- AddForeignKey
ALTER TABLE "email_change_request" ADD CONSTRAINT "email_change_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_change_request" ADD CONSTRAINT "password_change_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
