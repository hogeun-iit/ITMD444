import Fastify from "fastify";
import { z } from "zod";
import { logger } from "./lib/logger.js";

type VideoRow = {
  id: string;
  channelTitle: string;
  deckId: string;
  createdAt: string;
};

export async function buildApp() {
  const app = Fastify({ loggerInstance: logger });
  const videoUrl = process.env.VIDEO_SERVICE_URL ?? "http://127.0.0.1:4003";
  const queueUrl = process.env.QUEUE_SERVICE_URL ?? "http://127.0.0.1:4002";

  app.get("/health", async () => ({ ok: true, service: "analytics-service" }));

  app.get("/internal/dashboard", async (req, reply) => {
    const q = z.object({ userId: z.string().uuid() }).safeParse(req.query);
    if (!q.success) return reply.status(400).send({ error: "invalid_query" });

    const [videosRes, decksRes] = await Promise.all([
      fetch(`${videoUrl}/internal/videos?userId=${q.data.userId}&limit=200`),
      fetch(`${queueUrl}/internal/decks?userId=${q.data.userId}`),
    ]);

    if (!videosRes.ok || !decksRes.ok) {
      return reply.status(502).send({ error: "upstream_error" });
    }

    const videosJson = (await videosRes.json()) as { items: VideoRow[] };
    const decksJson = (await decksRes.json()) as {
      items: Array<{ id: string; name: string }>;
    };

    const videos = videosJson.items ?? [];
    const decks = decksJson.items ?? [];
    const deckNames = new Map(decks.map((d) => [d.id, d.name]));

    const byChannel = new Map<string, number>();
    for (const v of videos) {
      const c = v.channelTitle || "Unknown";
      byChannel.set(c, (byChannel.get(c) ?? 0) + 1);
    }
    const topChannels = [...byChannel.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([channelTitle, count]) => ({ channelTitle, count }));

    const recent = [...videos]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((v) => ({
        id: v.id,
        deckName: deckNames.get(v.deckId) ?? v.deckId,
        channelTitle: v.channelTitle,
      }));

    return {
      totalVideos: videos.length,
      totalDecks: decks.length,
      topChannels,
      recentlySaved: recent,
      reviewStreakDays: 0,
    };
  });

  return app;
}
