import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { sendZodError } from "../lib/errors";
import {
  createVideo,
  deleteVideo,
  getVideo,
  updateVideo,
} from "../services/videoService";
import { createVideoBodySchema, updateVideoBodySchema } from "../schemas/video";
import { requireSession } from "../lib/sessionAuth";

const videoIdParams = z.object({
  videoId: z.string().uuid(),
});

export const videoRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/videos/:videoId",
    {
      preHandler: requireSession,
      schema: {
        tags: ["videos"],
        summary: "Get one saved video",
        params: {
          type: "object",
          required: ["videoId"],
          properties: { videoId: { type: "string", format: "uuid" } },
        },
      },
    },
    async (req, reply) => {
      try {
        const { videoId } = videoIdParams.parse(req.params);
        const sessionUid = req.session.get("userId")!;
        const result = await getVideo(videoId);
        if (result.type === "not_found") {
          return reply.code(404).send({
            error: "not_found",
            message: "Video was not found",
          });
        }
        if (result.data.userId !== sessionUid) {
          return reply.code(403).send({
            error: "forbidden",
            message: "Not your video",
          });
        }
        return reply.send(result.data);
      } catch (err) {
        if (err instanceof z.ZodError) return sendZodError(reply, err);
        throw err;
      }
    },
  );

  app.post(
    "/videos",
    {
      preHandler: requireSession,
      schema: {
        tags: ["videos"],
        summary: "Save YouTube URL into a deck",
        body: {
          type: "object",
          required: ["userId", "deckId", "youtubeUrl"],
          properties: {
            userId: { type: "string", format: "uuid" },
            deckId: { type: "string", format: "uuid" },
            youtubeUrl: { type: "string" },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const body = createVideoBodySchema.parse(req.body);
        const sessionUid = req.session.get("userId")!;
        if (body.userId !== sessionUid) {
          return reply.code(403).send({
            error: "forbidden",
            message: "Body userId must match the signed-in user",
          });
        }
        const result = await createVideo(body);
        if (result.type === "user_not_found") {
          return reply.code(404).send({
            error: "not_found",
            message: "User was not found",
          });
        }
        if (result.type === "deck_not_found") {
          return reply.code(404).send({
            error: "not_found",
            message: "Deck was not found for this user",
          });
        }
        if (result.type === "invalid_youtube_url") {
          return reply.code(400).send({
            error: "invalid_youtube_url",
            message: "Could not parse a valid YouTube video id from youtubeUrl",
          });
        }
        if (result.type === "duplicate_video") {
          return reply.code(409).send({
            error: "duplicate_video",
            message: "This video is already saved in this deck",
          });
        }
        return reply.code(201).send(result.data);
      } catch (err) {
        if (err instanceof z.ZodError) return sendZodError(reply, err);
        throw err;
      }
    },
  );

  app.put(
    "/videos/:videoId",
    {
      preHandler: requireSession,
      schema: {
        tags: ["videos"],
        summary: "Update saved video",
        params: {
          type: "object",
          required: ["videoId"],
          properties: { videoId: { type: "string", format: "uuid" } },
        },
        body: {
          type: "object",
          properties: {
            transcriptStatus: {
              type: "string",
              enum: ["METADATA_ONLY", "TRANSCRIPT_READY", "FAILED"],
            },
            deckId: { type: "string", format: "uuid" },
            archived: { type: "boolean" },
          },
        },
      },
    },
    async (req, reply) => {
      try {
        const { videoId } = videoIdParams.parse(req.params);
        const sessionUid = req.session.get("userId")!;
        const owner = await getVideo(videoId);
        if (owner.type === "not_found") {
          return reply.code(404).send({
            error: "not_found",
            message: "Video was not found",
          });
        }
        if (owner.data.userId !== sessionUid) {
          return reply.code(403).send({
            error: "forbidden",
            message: "Not your video",
          });
        }
        const body = updateVideoBodySchema.parse(req.body ?? {});
        const result = await updateVideo(videoId, body);
        if (result.type === "not_found") {
          return reply.code(404).send({
            error: "not_found",
            message: "Video was not found",
          });
        }
        if (result.type === "deck_not_found") {
          return reply.code(404).send({
            error: "not_found",
            message: "Deck was not found for this user",
          });
        }
        return reply.send(result.data);
      } catch (err) {
        if (err instanceof z.ZodError) return sendZodError(reply, err);
        throw err;
      }
    },
  );

  app.delete(
    "/videos/:videoId",
    {
      preHandler: requireSession,
      schema: {
        tags: ["videos"],
        summary: "Hard-delete saved video",
        description:
          "Deletes the `videos` row (and cascades `video_analyses`). Repeat DELETE returns 404.",
        params: {
          type: "object",
          required: ["videoId"],
          properties: { videoId: { type: "string", format: "uuid" } },
        },
      },
    },
    async (req, reply) => {
      try {
        const { videoId } = videoIdParams.parse(req.params);
        const sessionUid = req.session.get("userId")!;
        const owner = await getVideo(videoId);
        if (owner.type === "not_found") {
          return reply.code(404).send({
            error: "not_found",
            message: "Video was not found",
          });
        }
        if (owner.data.userId !== sessionUid) {
          return reply.code(403).send({
            error: "forbidden",
            message: "Not your video",
          });
        }
        const result = await deleteVideo(videoId);
        if (result.type === "not_found") {
          return reply.code(404).send({
            error: "not_found",
            message: "Video was not found",
          });
        }
        return reply.code(204).send();
      } catch (err) {
        if (err instanceof z.ZodError) return sendZodError(reply, err);
        throw err;
      }
    },
  );
};
