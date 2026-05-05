import { z } from "zod";

/** Stored on `Video.transcriptStatus`. */
export const transcriptStatusSchema = z.enum([
  "METADATA_ONLY",
  "TRANSCRIPT_READY",
  "FAILED",
]);

/** `POST /videos` — aligns with `backend-dev-api.md`. */
export const createVideoBodySchema = z.object({
  userId: z.string().uuid(),
  deckId: z.string().uuid(),
  youtubeUrl: z.string().min(1),
});

export type CreateVideoBody = z.infer<typeof createVideoBodySchema>;

export const updateVideoBodySchema = z.object({
  transcriptStatus: transcriptStatusSchema.optional(),
  deckId: z.string().uuid().optional(),
  archived: z.boolean().optional(),
});

export type UpdateVideoBody = z.infer<typeof updateVideoBodySchema>;
