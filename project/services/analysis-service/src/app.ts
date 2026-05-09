import Fastify from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma.js";
import { logger } from "./lib/logger.js";
import { generateDigestWithOpenAI } from "./openaiDigest.js";

export async function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  app.get("/health", async () => ({ ok: true, service: "analysis-service" }));

  app.get("/internal/analysis/:videoId", async (req, reply) => {
    const videoId = (req.params as { videoId: string }).videoId;
    const row = await prisma.videoAnalysis.findUnique({ where: { videoId } });
    if (!row) return reply.status(404).send({ error: "not_found" });
    return row;
  });

  app.post("/internal/analysis/digest", async (req, reply) => {
    const parsed = z
      .object({
        videoId: z.string().uuid(),
        title: z.string(),
        channelTitle: z.string(),
        text: z.string(),
        decks: z.array(z.object({ id: z.string().uuid(), name: z.string() })),
      })
      .safeParse(req.body);
    if (!parsed.success) return reply.status(400).send({ error: "invalid_body" });

    const digest = await generateDigestWithOpenAI({
      title: parsed.data.title,
      channelTitle: parsed.data.channelTitle,
      transcriptOrSummaryText: parsed.data.text,
      decks: parsed.data.decks,
    });

    const saved = await prisma.videoAnalysis.upsert({
      where: { videoId: parsed.data.videoId },
      create: {
        videoId: parsed.data.videoId,
        summary: digest.summary,
        keyTakeaways: digest.keyTakeawaysJson,
        suggestedTags: digest.suggestedTagsJson,
        difficulty: digest.difficulty,
        recommendedDeckId: digest.recommendedDeckId,
        reviewQuestions: digest.reviewQuestionsJson,
        estimatedValue: digest.estimatedLearningValue,
      },
      update: {
        summary: digest.summary,
        keyTakeaways: digest.keyTakeawaysJson,
        suggestedTags: digest.suggestedTagsJson,
        difficulty: digest.difficulty,
        recommendedDeckId: digest.recommendedDeckId,
        reviewQuestions: digest.reviewQuestionsJson,
        estimatedValue: digest.estimatedLearningValue,
      },
    });

    return saved;
  });

  return app;
}
