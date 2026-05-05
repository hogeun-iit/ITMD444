import { prisma } from "../lib/prisma";
import { paginateMeta, type PaginationQuery } from "../lib/pagination";
import type { UpdateVideoBody } from "../schemas/video";
import { extractYoutubeVideoId, resolveYoutubeMetadata } from "../lib/youtube";

/** Paginated saved videos for a user (non-archived by default). */
export async function listUserVideos(userId: string, p: PaginationQuery) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { type: "not_found" as const };

  const where = { archived: false, deck: { userId } };
  const total = await prisma.video.count({ where });

  const rows = await prisma.video.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (p.page - 1) * p.pageSize,
    take: p.pageSize,
    include: { deck: true },
  });

  const data = rows.map((v) => ({
    id: v.id,
    userId,
    deckId: v.deckId,
    deckName: v.deck.name,
    youtubeVideoId: v.youtubeVideoId,
    title: v.title,
    channelTitle: v.channelTitle,
    thumbnailUrl: v.thumbnailUrl,
    transcriptStatus: v.transcriptStatus,
    archived: v.archived,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }));

  return {
    type: "ok" as const,
    data,
    meta: paginateMeta(p.page, p.pageSize, total),
  };
}

export async function getVideo(videoId: string) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      deck: { include: { user: true } },
      analysis: true,
    },
  });
  if (!video) return { type: "not_found" as const };

  return {
    type: "ok" as const,
    data: {
      id: video.id,
      userId: video.deck.userId,
      deck: {
        id: video.deck.id,
        name: video.deck.name,
      },
      youtubeVideoId: video.youtubeVideoId,
      title: video.title,
      description: video.description,
      channelTitle: video.channelTitle,
      thumbnailUrl: video.thumbnailUrl,
      durationSec: video.durationSec,
      publishedAt: video.publishedAt?.toISOString() ?? null,
      transcriptStatus: video.transcriptStatus,
      archived: video.archived,
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
      user: {
        id: video.deck.user.id,
        email: video.deck.user.email,
        fullName: video.deck.user.fullName,
      },
      analysis: video.analysis
        ? {
            id: video.analysis.id,
            summary: video.analysis.summary,
            keyTakeaways: video.analysis.keyTakeaways,
          }
        : null,
    },
  };
}

export type CreateVideoInput = {
  userId: string;
  deckId: string;
  youtubeUrl: string;
};

export async function createVideo(input: CreateVideoInput) {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) return { type: "user_not_found" as const };

  const deck = await prisma.deck.findFirst({
    where: { id: input.deckId, userId: input.userId },
  });
  if (!deck) return { type: "deck_not_found" as const };

  const ytId = extractYoutubeVideoId(input.youtubeUrl);
  if (!ytId) return { type: "invalid_youtube_url" as const };

  const existing = await prisma.video.findUnique({
    where: {
      deckId_youtubeVideoId: { deckId: input.deckId, youtubeVideoId: ytId },
    },
  });
  if (existing) return { type: "duplicate_video" as const };

  const meta = await resolveYoutubeMetadata(ytId);

  try {
    const video = await prisma.$transaction(async (tx) => {
      const v = await tx.video.create({
        data: {
          deckId: input.deckId,
          youtubeVideoId: ytId,
          title: meta.title,
          description: meta.description,
          channelTitle: meta.channelTitle,
          thumbnailUrl: meta.thumbnailUrl,
          durationSec: meta.durationSec,
          publishedAt: meta.publishedAt,
          transcriptStatus: "METADATA_ONLY",
        },
      });
      await tx.videoAnalysis.create({
        data: { videoId: v.id },
      });
      return tx.video.findUniqueOrThrow({
        where: { id: v.id },
        include: { deck: true, analysis: true },
      });
    });

    return {
      type: "ok" as const,
      data: {
        id: video.id,
        userId: input.userId,
        deckId: video.deckId,
        youtubeVideoId: video.youtubeVideoId,
        title: video.title,
        channelTitle: video.channelTitle,
        transcriptStatus: video.transcriptStatus,
        createdAt: video.createdAt.toISOString(),
        analysisId: video.analysis?.id ?? null,
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Unique constraint")) {
      return { type: "duplicate_video" as const };
    }
    throw e;
  }
}

export async function updateVideo(videoId: string, body: UpdateVideoBody) {
  const existing = await prisma.video.findUnique({
    where: { id: videoId },
    include: { deck: true },
  });
  if (!existing) return { type: "not_found" as const };

  if (body.deckId !== undefined) {
    const target = await prisma.deck.findFirst({
      where: { id: body.deckId, userId: existing.deck.userId },
    });
    if (!target) return { type: "deck_not_found" as const };
  }

  const video = await prisma.video.update({
    where: { id: videoId },
    data: {
      ...(body.transcriptStatus !== undefined && { transcriptStatus: body.transcriptStatus }),
      ...(body.deckId !== undefined && { deckId: body.deckId }),
      ...(body.archived !== undefined && { archived: body.archived }),
    },
    include: { deck: true },
  });

  return {
    type: "ok" as const,
    data: {
      id: video.id,
      userId: video.deck.userId,
      deckId: video.deckId,
      transcriptStatus: video.transcriptStatus,
      archived: video.archived,
      updatedAt: video.updatedAt.toISOString(),
    },
  };
}

/** Hard-delete video row; `video_analyses` cascades on FK. */
export async function deleteVideo(videoId: string) {
  const existing = await prisma.video.findUnique({ where: { id: videoId } });
  if (!existing) return { type: "not_found" as const };

  await prisma.video.delete({ where: { id: videoId } });
  return { type: "ok" as const };
}
