import OpenAI from "openai";
import { z } from "zod";

const DigestSchema = z.object({
  summary: z.string(),
  keyTakeaways: z.array(z.string()).default([]),
  difficulty: z.string().nullable().optional(),
  recommendedDeckId: z.string().uuid().nullable().optional(),
});

export type DigestResult = {
  summary: string;
  keyTakeawaysJson: string;
  difficulty: string | null;
  recommendedDeckId: string | null;
};

/**
 * Generates digest fields for `video_analyses`. Requires `OPENAI_API_KEY`.
 * `recommendedDeckId` must be one of the supplied deck ids (or null).
 */
export async function generateDigestWithOpenAI(params: {
  title: string;
  channelTitle: string;
  transcriptOrSummaryText: string;
  decks: { id: string; name: string }[];
}): Promise<DigestResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const client = new OpenAI({ apiKey, timeout: 120_000 });
  const deckLines = params.decks.map((d) => `- ${d.id} (${d.name})`).join("\n");
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You help learners digest YouTube educational videos. Reply with JSON only, no markdown.",
      },
      {
        role: "user",
        content:
          `Video title: ${params.title}\nChannel: ${params.channelTitle}\n\nText (transcript or metadata fallback):\n` +
          `${params.transcriptOrSummaryText.slice(0, 14_000)}\n\n` +
          `User's decks — set recommendedDeckId to exactly one id below, or null:\n${deckLines}\n\n` +
          `Return JSON shape: { "summary": string, "keyTakeaways": string[], "difficulty": string | null, "recommendedDeckId": string | null }`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = DigestSchema.parse(JSON.parse(raw));
  const allowed = new Set(params.decks.map((d) => d.id));
  const rec =
    parsed.recommendedDeckId && allowed.has(parsed.recommendedDeckId)
      ? parsed.recommendedDeckId
      : null;

  return {
    summary: parsed.summary,
    keyTakeawaysJson: JSON.stringify(parsed.keyTakeaways),
    difficulty: parsed.difficulty ?? null,
    recommendedDeckId: rec,
  };
}
