import { YoutubeTranscript } from "youtube-transcript";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetches captions via public transcript endpoints (no OAuth).
 * Retries on transient failures; throws if unavailable (caller sets METADATA_ONLY / error text).
 */
export async function fetchTranscriptWithRetry(
  youtubeVideoId: string,
  retries = 2,
): Promise<{ text: string; duration: number; offset: number }[]> {
  let last: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await YoutubeTranscript.fetchTranscript(youtubeVideoId);
    } catch (e) {
      last = e;
      await sleep(350 * (attempt + 1));
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}

export function transcriptToText(
  lines: { text: string; duration: number; offset: number }[],
): string {
  return lines.map((l) => l.text).join(" ").replace(/\s+/g, " ").trim();
}
