CREATE SCHEMA IF NOT EXISTS "tubedeck_video";

CREATE TABLE "tubedeck_video"."videos" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "youtube_video_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "channel_title" TEXT NOT NULL DEFAULT '',
    "thumbnail_url" TEXT,
    "duration_sec" INTEGER,
    "published_at" TIMESTAMP(3),
    "transcript_status" TEXT NOT NULL DEFAULT 'METADATA_ONLY',
    "transcript_text" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "videos_deck_id_youtube_video_id_key" ON "tubedeck_video"."videos"("deck_id", "youtube_video_id");

CREATE INDEX "videos_user_id_idx" ON "tubedeck_video"."videos"("user_id");

CREATE INDEX "videos_deck_id_idx" ON "tubedeck_video"."videos"("deck_id");
