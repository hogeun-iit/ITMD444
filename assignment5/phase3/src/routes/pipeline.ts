import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { sendZodError } from "../lib/errors";
import { requireSession } from "../lib/sessionAuth";
import { getPipelineStatus } from "../services/pipelineService";
import { getVideo } from "../services/videoService";

const paramsSchema = z.object({
  videoId: z.string().uuid(),
});

export const pipelineRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/videos/:videoId/pipeline",
    {
      preHandler: requireSession,
      schema: {
        tags: ["pipeline"],
        summary: "Transcript / digest pipeline status",
        description:
          "Stages for captions fetch + optional OpenAI digest per Phase 2 `backend-dev-api.md`. Not shipping tracking.",
        params: {
          type: "object",
          required: ["videoId"],
          properties: { videoId: { type: "string", format: "uuid" } },
        },
      },
    },
    async (req, reply) => {
      try {
        const { videoId } = paramsSchema.parse(req.params);
        const sessionUid = req.session.get("userId")!;
        const owner = await getVideo(videoId);
        if (owner.type === "not_found") {
          return reply.code(404).send({ error: "not_found", message: "Video was not found" });
        }
        if (owner.data.userId !== sessionUid) {
          return reply.code(403).send({ error: "forbidden", message: "Not your video" });
        }
        const payload = await getPipelineStatus(videoId);
        if (!payload) {
          return reply.code(404).send({ error: "not_found", message: "Video was not found" });
        }
        return reply.send(payload);
      } catch (err) {
        if (err instanceof z.ZodError) return sendZodError(reply, err);
        throw err;
      }
    },
  );
};
