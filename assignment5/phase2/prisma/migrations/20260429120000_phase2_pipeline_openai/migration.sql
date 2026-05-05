-- Phase 2: queue fields, pipeline timestamps, AI digest FK

ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "queue_order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "favorite_rank" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "pipeline_last_error" TEXT;
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "transcript_fetched_at" TIMESTAMP(3);
ALTER TABLE "videos" ADD COLUMN IF NOT EXISTS "digest_completed_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "videos_deck_id_queue_order_idx" ON "videos"("deck_id", "queue_order");

ALTER TABLE "video_analyses" ADD COLUMN IF NOT EXISTS "recommended_deck_id" TEXT;
ALTER TABLE "video_analyses" ADD COLUMN IF NOT EXISTS "difficulty" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'video_analyses_recommended_deck_id_fkey'
  ) THEN
    ALTER TABLE "video_analyses"
      ADD CONSTRAINT "video_analyses_recommended_deck_id_fkey"
      FOREIGN KEY ("recommended_deck_id") REFERENCES "decks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "video_analyses_recommended_deck_id_idx" ON "video_analyses"("recommended_deck_id");
