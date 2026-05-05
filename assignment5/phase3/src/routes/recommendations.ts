import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { sendZodError } from "../lib/errors";
import { requireSession } from "../lib/sessionAuth";
import { getRecommendationsForUser } from "../services/recommendationsService";

const paramsSchema = z.object({
  userId: z.string().uuid(),
});

export const recommendationsRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/users/:userId/recommendations",
    {
      preHandler: requireSession,
      schema: {
        tags: ["recommendations"],
        summary: "Saved-library resurfacing hints",
        description:
          "TubeDeck Phase 2: FIFO queue head per deck — **not** global YouTube discovery.",
        params: {
          type: "object",
          required: ["userId"],
          properties: { userId: { type: "string", format: "uuid" } },
        },
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 50, default: 20 },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const { userId } = paramsSchema.parse(req.params);
        const sessionUid = req.session.get("userId")!;
        if (sessionUid !== userId) {
          return reply.code(403).send({
            error: "forbidden",
            message: "Cannot read another user's recommendations",
          });
        }
        const limit = z.coerce.number().int().min(1).max(50).parse(
          (req.query as Record<string, unknown>).limit ?? 20,
        );
        const result = await getRecommendationsForUser(userId, limit);
        return reply.send(result);
      } catch (err) {
        if (err instanceof z.ZodError) return sendZodError(reply, err);
        throw err;
      }
    },
  );
};
