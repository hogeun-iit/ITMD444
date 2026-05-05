import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { sendZodError } from "../lib/errors";
import { parsePagination } from "../lib/pagination";
import { requireSession } from "../lib/sessionAuth";
import { listUserVideos } from "../services/videoService";

const paramsSchema = z.object({
  userId: z.string().uuid(),
});

export const userVideoRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/users/:userId/videos",
    {
      preHandler: requireSession,
      schema: {
        tags: ["users"],
        summary: "List saved videos for a user",
        description:
          "Returns non-archived videos across all of the user’s decks. Caller must be signed in as the same `userId`.",
        params: {
          type: "object",
          required: ["userId"],
          properties: { userId: { type: "string", format: "uuid" } },
        },
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            pageSize: { type: "integer", minimum: 1, maximum: 100, default: 10 },
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
            message: "Cannot list another user's videos",
          });
        }
        const pagination = parsePagination(req.query as Record<string, unknown>);
        const result = await listUserVideos(userId, pagination);
        if (result.type === "not_found") {
          return reply.code(404).send({
            error: "not_found",
            message: "User was not found",
          });
        }
        return reply.send({ data: result.data, meta: result.meta });
      } catch (err) {
        if (err instanceof z.ZodError) return sendZodError(reply, err);
        throw err;
      }
    },
  );
};
