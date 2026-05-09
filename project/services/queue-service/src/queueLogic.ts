import type { Prisma, PrismaClient } from "./generated/prisma/index.js";

export type ReviewAction = "VIEWED" | "SKIP" | "PIN" | "FAVORITE" | "ARCHIVE";

async function nextPosition(tx: Prisma.TransactionClient, deckId: string) {
  const agg = await tx.queueItem.aggregate({
    where: { deckId, archived: false },
    _max: { position: true },
  });
  return (agg._max.position ?? -1) + 1;
}

export async function appendQueueItem(
  prisma: PrismaClient,
  params: { deckId: string; videoId: string },
) {
  return prisma.$transaction(async (tx) => {
    const pos = await nextPosition(tx, params.deckId);
    return tx.queueItem.upsert({
      where: { deckId_videoId: { deckId: params.deckId, videoId: params.videoId } },
      create: { deckId: params.deckId, videoId: params.videoId, position: pos },
      update: { archived: false, position: pos },
    });
  });
}

export async function applyReviewAction(
  prisma: PrismaClient,
  params: { userId: string; deckId: string; videoId: string; action: ReviewAction },
) {
  const deck = await prisma.deck.findFirst({ where: { id: params.deckId, userId: params.userId } });
  if (!deck) throw new Error("deck_not_found");

  const item = await prisma.queueItem.findFirst({
    where: { deckId: params.deckId, videoId: params.videoId },
  });
  if (!item) throw new Error("queue_item_not_found");

  await prisma.reviewLog.create({
    data: {
      userId: params.userId,
      deckId: params.deckId,
      videoId: params.videoId,
      action: params.action,
    },
  });

  if (params.action === "ARCHIVE") {
    await prisma.queueItem.update({
      where: { id: item.id },
      data: { archived: true },
    });
    return { ok: true };
  }

  if (params.action === "FAVORITE") {
    await prisma.queueItem.update({
      where: { id: item.id },
      data: { favoriteRank: item.favoriteRank + 1 },
    });
    return { ok: true };
  }

  if (params.action === "PIN") {
    await prisma.queueItem.update({
      where: { id: item.id },
      data: { pinned: true, position: -1 },
    });
    await normalizePositions(prisma, params.deckId);
    return { ok: true };
  }

  if (params.action === "VIEWED") {
    const tail = await nextPosition(prisma, params.deckId);
    await prisma.queueItem.update({
      where: { id: item.id },
      data: { pinned: false, position: tail },
    });
    await normalizePositions(prisma, params.deckId);
    return { ok: true };
  }

  if (params.action === "SKIP") {
    const mid = Math.floor((await nextPosition(prisma, params.deckId)) / 2);
    await prisma.queueItem.update({
      where: { id: item.id },
      data: { position: mid },
    });
    await normalizePositions(prisma, params.deckId);
    return { ok: true };
  }

  return { ok: true };
}

/** 재정렬: pinned 우선, favoriteRank, position */
export async function normalizePositions(prisma: PrismaClient, deckId: string) {
  const items = await prisma.queueItem.findMany({
    where: { deckId, archived: false },
    orderBy: [{ pinned: "desc" }, { favoriteRank: "desc" }, { position: "asc" }],
  });
  let i = 0;
  for (const it of items) {
    await prisma.queueItem.update({ where: { id: it.id }, data: { position: i } });
    i += 1;
  }
}
