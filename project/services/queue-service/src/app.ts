import Fastify from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma.js";
import { logger } from "./lib/logger.js";
import { appendQueueItem, applyReviewAction } from "./queueLogic.js";

const createDeckBody = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  defaultCadence: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  queueMode: z.string().optional(),
});

const updateDeckBody = createDeckBody.partial().omit({ userId: true });

export async function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  app.get("/health", async () => ({ ok: true, service: "queue-service" }));

  app.get("/internal/decks", async (req, reply) => {
    const q = z.object({ userId: z.string().uuid() }).safeParse(req.query);
    if (!q.success) return reply.status(400).send({ error: "invalid_query" });
    const decks = await prisma.deck.findMany({
      where: { userId: q.data.userId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return { items: decks };
  });

  app.get("/internal/decks/:id", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const deck = await prisma.deck.findUnique({ where: { id } });
    if (!deck) return reply.status(404).send({ error: "not_found" });
    return deck;
  });

  app.post("/internal/decks", async (req, reply) => {
    const parsed = createDeckBody.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: "invalid_body" });
    const d = parsed.data;
    const deck = await prisma.deck.create({
      data: {
        userId: d.userId,
        name: d.name,
        description: d.description ?? undefined,
        icon: d.icon ?? undefined,
        color: d.color ?? undefined,
        defaultCadence: d.defaultCadence ?? undefined,
        sortOrder: d.sortOrder ?? 0,
        queueMode: d.queueMode ?? "FIFO",
      },
    });
    return deck;
  });

  app.patch("/internal/decks/:id", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const parsed = updateDeckBody.extend({ userId: z.string().uuid() }).safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: "invalid_body" });
    const { userId, ...data } = parsed.data;
    const existing = await prisma.deck.findFirst({ where: { id, userId } });
    if (!existing) return reply.status(404).send({ error: "not_found" });
    const deck = await prisma.deck.update({ where: { id }, data });
    return deck;
  });

  app.delete("/internal/decks/:id", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const q = z.object({ userId: z.string().uuid() }).safeParse(req.query);
    if (!q.success) return reply.status(400).send({ error: "invalid_query" });
    const existing = await prisma.deck.findFirst({ where: { id, userId: q.data.userId } });
    if (!existing) return reply.status(404).send({ error: "not_found" });
    await prisma.deck.delete({ where: { id } });
    return { ok: true };
  });

  app.post("/internal/queue/items", async (req, reply) => {
    const parsed = z
      .object({ deckId: z.string().uuid(), videoId: z.string().uuid() })
      .safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: "invalid_body" });
    const item = await appendQueueItem(prisma, parsed.data);
    return item;
  });

  app.get("/internal/queue/next", async (req, reply) => {
    const q = z.object({ deckId: z.string().uuid() }).safeParse(req.query);
    if (!q.success) return reply.status(400).send({ error: "invalid_query" });
    const items = await prisma.queueItem.findMany({
      where: { deckId: q.data.deckId, archived: false },
      orderBy: [{ pinned: "desc" }, { favoriteRank: "desc" }, { position: "asc" }],
      take: 1,
    });
    return { videoId: items[0]?.videoId ?? null };
  });

  app.post("/internal/queue/review", async (req, reply) => {
    const parsed = z
      .object({
        userId: z.string().uuid(),
        deckId: z.string().uuid(),
        videoId: z.string().uuid(),
        action: z.enum(["VIEWED", "SKIP", "PIN", "FAVORITE", "ARCHIVE"]),
      })
      .safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: "invalid_body" });
    try {
      await applyReviewAction(prisma, parsed.data);
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "error";
      if (msg === "deck_not_found" || msg === "queue_item_not_found") {
        return reply.status(404).send({ error: msg });
      }
      throw e;
    }
  });

  return app;
}
