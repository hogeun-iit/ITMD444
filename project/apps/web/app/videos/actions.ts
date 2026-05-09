"use server";

import { revalidatePath } from "next/cache";
import { runGraphql } from "@/lib/graphql";

const SAVE = /* GraphQL */ `
  mutation Save($deckId: ID!, $url: String!, $fetchTranscript: Boolean) {
    saveVideo(deckId: $deckId, url: $url, fetchTranscript: $fetchTranscript) {
      id
      title
      youtubeVideoId
      transcriptStatus
    }
  }
`;

const ANALYZE = /* GraphQL */ `
  mutation Analyze($videoId: ID!) {
    analyzeVideo(videoId: $videoId) {
      id
      summary
      difficulty
    }
  }
`;

const REVIEW = /* GraphQL */ `
  mutation Review($deckId: ID!, $videoId: ID!, $action: ReviewAction!) {
    reviewVideo(deckId: $deckId, videoId: $videoId, action: $action)
  }
`;

export async function saveVideoAction(formData: FormData) {
  const deckId = String(formData.get("deckId") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  const fetchTranscript = formData.get("fetchTranscript") === "on";
  if (!deckId || !url) throw new Error("Please select a deck and enter a URL.");
  await runGraphql(SAVE, { deckId, url, fetchTranscript });
  revalidatePath("/videos");
}

export async function analyzeVideoFormAction(formData: FormData) {
  const videoId = String(formData.get("videoId") ?? "");
  if (!videoId) throw new Error("missing videoId");
  await runGraphql(ANALYZE, { videoId });
  revalidatePath("/videos");
}

export async function reviewFormAction(formData: FormData) {
  const deckId = String(formData.get("deckId") ?? "");
  const videoId = String(formData.get("videoId") ?? "");
  const action = String(formData.get("action") ?? "");
  if (!deckId || !videoId || !action) throw new Error("missing fields");
  await runGraphql(REVIEW, { deckId, videoId, action });
  revalidatePath("/videos");
}
