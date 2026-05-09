-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "tubedeck_auth";

-- CreateTable
CREATE TABLE "tubedeck_auth"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "google_sub" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "tubedeck_auth"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_sub_key" ON "tubedeck_auth"."users"("google_sub");
