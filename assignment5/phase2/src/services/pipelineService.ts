import { prisma } from "../lib/prisma";
import { generateDigestWithOpenAI } from "../lib/openaiDigest";
import { fetchTranscriptWithRetry, transcriptToText } from "../lib/transcript";

export type PipelineStage = {
  id: "metadata" | "transcript" | "digest";
  status: "complete" | "pending" | "failed" | "skipped";
  at: string | null;
  detail?: string;
};

export type PipelineStatusPayload = {
  videoId: string;
  transcriptStatus: string;
  stages: PipelineStage[];
  lastError: string | null;
  digestCompletedAt: string | null;
  externalRefs: {
    youtubeVideoId: string;
    openaiModel: string | null;
  };
};

export function schedulePipeline(videoId: string): void {
  setImmediate(() => {
    runVideoPipeline(videoId).catch((err) => {
      console.error("[pipeline]", videoId, err);
    });
  });
}

/** Background job: captions → optional OpenAI digest (Phase 2). */
export async function runVideoPipeline(videoId: string): Promise<void> {
  const row = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      deck: { include: { user: true } },
      analysis: true,
    },
  });
  if (!row) return;
  if (row.digestCompletedAt && process.env.PIPELINE_FORCE_RERUN !== "1") {
    return;
  }

  let transcriptPlain = "";
  try {
    const lines = await fetchTranscriptWithRetry(row.youtubeVideoId);
    transcriptPlain = transcriptToText(lines);
    await prisma.video.update({
      where: { id: videoId },
      data: {
        transcriptStatus: "TRANSCRIPT_READY",
        transcriptFetchedAt: new Date(),
        pipelineLastError: null,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.video.update({
      where: { id: videoId },
      data: {
        transcriptStatus: "METADATA_ONLY",
        pipelineLastError: `transcript: ${msg}`,
      },
    });
  }

  const fallbackText = `${row.title}\n\n${row.description}`.slice(0, 14_000);
  const bodyText = transcriptPlain.length > 50 ? transcriptPlain.slice(0, 14_000) : fallbackText;

  if (!process.env.OPENAI_API_KEY) {
    return;
  }

  try {
    const decks = await prisma.deck.findMany({
      where: { userId: row.deck.userId },
      select: { id: true, name: true },
    });

    const digest = await generateDigestWithOpenAI({
      title: row.title,
      channelTitle: row.channelTitle,
      transcriptOrSummaryText: bodyText,
      decks,
    });

    await prisma.videoAnalysis.update({
      where: { videoId },
      data: {
        summary: digest.summary,
        keyTakeaways: digest.keyTakeawaysJson,
        difficulty: digest.difficulty,
        recommendedDeckId: digest.recommendedDeckId,
      },
    });

    await prisma.video.update({
      where: { id: videoId },
      data: {
        digestCompletedAt: new Date(),
        pipelineLastError: null,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.video.update({
      where: { id: videoId },
      data: { pipelineLastError: `digest: ${msg}` },
    });
  }
}

export async function getPipelineStatus(videoId: string): Promise<PipelineStatusPayload | null> {
  const v = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      id: true,
      youtubeVideoId: true,
      transcriptStatus: true,
      createdAt: true,
      transcriptFetchedAt: true,
      digestCompletedAt: true,
      pipelineLastError: true,
    },
  });
  if (!v) return null;

  const metaAt = v.createdAt.toISOString();
  const stages: PipelineStage[] = [
    { id: "metadata", status: "complete", at: metaAt },
    {
      id: "transcript",
      status:
        v.transcriptStatus === "TRANSCRIPT_READY"
          ? "complete"
          : v.pipelineLastError?.startsWith("transcript:")
            ? "failed"
            : v.transcriptStatus === "FAILED"
              ? "failed"
              : "pending",
      at: v.transcriptFetchedAt?.toISOString() ?? null,
      detail: v.transcriptStatus,
    },
    {
      id: "digest",
      status: !process.env.OPENAI_API_KEY
        ? "skipped"
        : v.digestCompletedAt
          ? "complete"
          : v.pipelineLastError?.startsWith("digest:")
            ? "failed"
            : "pending",
      at: v.digestCompletedAt?.toISOString() ?? null,
      detail: process.env.OPENAI_API_KEY ? undefined : "OPENAI_API_KEY not set",
    },
  ];

  return {
    videoId: v.id,
    transcriptStatus: v.transcriptStatus,
    stages,
    lastError: v.pipelineLastError,
    digestCompletedAt: v.digestCompletedAt?.toISOString() ?? null,
    externalRefs: {
      youtubeVideoId: v.youtubeVideoId,
      openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    },
  };
}
