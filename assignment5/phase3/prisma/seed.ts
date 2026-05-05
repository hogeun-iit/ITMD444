import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.videoAnalysis.deleteMany();
  await prisma.video.deleteMany();
  await prisma.deck.deleteMany();
  await prisma.user.deleteMany();

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      fullName: "Alice Kim",
    },
  });

  const deckBackend = await prisma.deck.create({
    data: {
      userId: alice.id,
      name: "Backend",
      description: "Systems & APIs",
      sortOrder: 0,
    },
  });

  const deckAi = await prisma.deck.create({
    data: {
      userId: alice.id,
      name: "AI",
      description: "LLMs & tooling",
      sortOrder: 1,
    },
  });

  const v1 = await prisma.video.create({
    data: {
      deckId: deckBackend.id,
      youtubeVideoId: "dQw4w9WgXcQ",
      title: "Sample backend talk",
      channelTitle: "Example Channel",
      transcriptStatus: "METADATA_ONLY",
    },
  });

  await prisma.videoAnalysis.create({
    data: { videoId: v1.id },
  });

  const v2 = await prisma.video.create({
    data: {
      deckId: deckAi.id,
      youtubeVideoId: "jNQXAC9IVRw",
      title: "Sample AI clip",
      channelTitle: "Another Channel",
      transcriptStatus: "METADATA_ONLY",
    },
  });

  await prisma.videoAnalysis.create({
    data: { videoId: v2.id },
  });

  console.log("Seed OK:", {
    userId: alice.id,
    deckIds: [deckBackend.id, deckAi.id],
    videoIds: [v1.id, v2.id],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
