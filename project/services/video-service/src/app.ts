import Fastify from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma.js";
import { logger } from "./lib/logger.js";
import { extractYoutubeVideoId, resolveYoutubeMetadata } from "./lib/youtube.js";
import { fetchTranscriptWithRetry, transcriptToText } from "./lib/transcript.js";

export async function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  app.get("/health", async () => ({ ok: true, service: "video-service" }));

  app.get("/internal/videos", async (req, reply) => {
    const q = z
      .object({
        userId: z.string().uuid(),
        deckId: z.string().uuid().optional(),
        q: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
      })
      .safeParse(req.query);
    if (!q.success) return reply.status(400).send({ error: "invalid_query" });
    const take = q.data.limit ?? 50;
    const where: {
      userId: string;
      deckId?: string;
      OR?: Array<Record<string, { contains: string; mode: "insensitive" }>>;
    } = { userId: q.data.userId };
    if (q.data.deckId) where.deckId = q.data.deckId;
    if (q.data.q) {
      where.OR = [
        { title: { contains: q.data.q, mode: "insensitive" } },
        { channelTitle: { contains: q.data.q, mode: "insensitive" } },
      ];
    }
    const items = await prisma.video.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
    });
    return { items };
  });

  app.get("/internal/videos/:id", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const v = await prisma.video.findUnique({ where: { id } });
    if (!v) return reply.status(404).send({ error: "not_found" });
    return v;
  });

  app.post("/internal/videos/save", async (req, reply) => {
    const parsed = z
      .object({
        userId: z.string().uuid(),
        deckId: z.string().uuid(),
        url: z.string().min(1),
        fetchTranscript: z.boolean().optional(),
      })
      .safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: "invalid_body" });

    const videoId = extractYoutubeVideoId(parsed.data.url);
    if (!videoId) return reply.status(400).send({ error: "invalid_youtube_url" });

    const meta = await resolveYoutubeMetadata(videoId);
    let transcriptStatus: "TRANSCRIPT_READY" | "METADATA_ONLY" | "FAILED" = "METADATA_ONLY";
    let transcriptText: string | null = null;

    if (parsed.data.fetchTranscript !== false) {
      try {
        const lines = await fetchTranscriptWithRetry(videoId);
        transcriptText = transcriptToText(lines);
        transcriptStatus = "TRANSCRIPT_READY";
      } catch {
        transcriptStatus = "METADATA_ONLY";
      }
    }

    try {
      const video = await prisma.video.create({
        data: {
          userId: parsed.data.userId,
          deckId: parsed.data.deckId,
          youtubeVideoId: videoId,
          title: meta.title,
          description: meta.description,
          channelTitle: meta.channelTitle,
          thumbnailUrl: meta.thumbnailUrl,
          durationSec: meta.durationSec,
          publishedAt: meta.publishedAt,
          transcriptStatus,
          transcriptText,
        },
      });
      return video;
    } catch (e: unknown) {
      const code = typeof e === "object" && e && "code" in e ? (e as { code: string }).code : "";
      if (code === "P2002") {
        return reply.status(409).send({ error: "video_already_in_deck" });
      }
      throw e;
    }
  });

  app.patch("/internal/videos/:id", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const parsed = z
      .object({
        userId: z.string().uuid(),
        archived: z.boolean().optional(),
        title: z.string().optional(),
      })
      .safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: "invalid_body" });

    const existing = await prisma.video.findFirst({
      where: { id, userId: parsed.data.userId },
    });
    if (!existing) return reply.status(404).send({ error: "not_found" });

    const v = await prisma.video.update({
      where: { id },
      data: {
        archived: parsed.data.archived,
        title: parsed.data.title,
      },
    });
    return v;
  });

  app.delete("/internal/videos/:id", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const q = z.object({ userId: z.string().uuid() }).safeParse(req.query);
    if (!q.success) return reply.status(400).send({ error: "invalid_query" });
    const existing = await prisma.video.findFirst({ where: { id, userId: q.data.userId } });
    if (!existing) return reply.status(404).send({ error: "not_found" });
    await prisma.video.delete({ where: { id } });
    return { ok: true };
  });

  return app;
}
