CREATE SCHEMA IF NOT EXISTS "tubedeck_queue";

CREATE TABLE "tubedeck_queue"."decks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "default_cadence" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "queue_mode" TEXT NOT NULL DEFAULT 'FIFO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tubedeck_queue"."queue_items" (
    "id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "favorite_rank" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "queue_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tubedeck_queue"."review_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "review_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "decks_user_id_idx" ON "tubedeck_queue"."decks"("user_id");

CREATE UNIQUE INDEX "queue_items_deck_id_video_id_key" ON "tubedeck_queue"."queue_items"("deck_id", "video_id");

CREATE INDEX "queue_items_deck_id_position_idx" ON "tubedeck_queue"."queue_items"("deck_id", "position");

CREATE INDEX "review_logs_user_id_idx" ON "tubedeck_queue"."review_logs"("user_id");

CREATE INDEX "review_logs_deck_id_idx" ON "tubedeck_queue"."review_logs"("deck_id");

ALTER TABLE "tubedeck_queue"."queue_items" ADD CONSTRAINT "queue_items_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "tubedeck_queue"."decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
