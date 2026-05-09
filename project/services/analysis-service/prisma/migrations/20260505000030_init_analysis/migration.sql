CREATE SCHEMA IF NOT EXISTS "tubedeck_analysis";

CREATE TABLE "tubedeck_analysis"."video_analyses" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "summary" TEXT,
    "key_takeaways" TEXT,
    "suggested_tags" TEXT,
    "difficulty" TEXT,
    "recommended_deck_id" TEXT,
    "review_questions" TEXT,
    "estimated_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "video_analyses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "video_analyses_video_id_key" ON "tubedeck_analysis"."video_analyses"("video_id");

CREATE INDEX "video_analyses_video_id_idx" ON "tubedeck_analysis"."video_analyses"("video_id");
