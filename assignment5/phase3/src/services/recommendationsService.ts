import { prisma } from "../lib/prisma";

export type RecommendationItem = {
  videoId: string;
  deckId: string;
  deckName: string;
  title: string;
  youtubeVideoId: string;
  queueOrder: number;
  pinned: boolean;
  favoriteRank: number;
  /** Why this row was chosen (saved-library resurfacing only). */
  reason: "queue_fifo_head";
  /** From AI digest when present — optional deck hint among user’s decks. */
  recommendedDeckIdFromDigest: string | null;
};

/**
 * PRD-aligned: **no** global YouTube discovery — only saved videos.
 * Per deck: order by pinned → favoriteRank → queueOrder (FIFO head).
 */
export async function getRecommendationsForUser(
  userId: string,
  limit = 20,
): Promise<{ items: RecommendationItem[]; note: string }> {
  const decks = await prisma.deck.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
    include: {
      videos: {
        where: { archived: false },
        orderBy: [{ pinned: "desc" }, { favoriteRank: "desc" }, { queueOrder: "asc" }],
        take: 1,
        include: {
          analysis: { select: { recommendedDeckId: true } },
        },
      },
    },
  });

  const items: RecommendationItem[] = [];
  for (const d of decks) {
    const v = d.videos[0];
    if (!v) continue;
    items.push({
      videoId: v.id,
      deckId: d.id,
      deckName: d.name,
      title: v.title,
      youtubeVideoId: v.youtubeVideoId,
      queueOrder: v.queueOrder,
      pinned: v.pinned,
      favoriteRank: v.favoriteRank,
      reason: "queue_fifo_head",
      recommendedDeckIdFromDigest: v.analysis?.recommendedDeckId ?? null,
    });
    if (items.length >= limit) break;
  }

  return {
    items,
    note: "Resurfacing only — candidates are from your saved library (TubeDeck non-goal: no global discovery).",
  };
}
