import { GraphQLScalarType, Kind } from "graphql";
import type { YogaInitialContext } from "graphql-yoga";
import { urls, j } from "../services/http.js";
import { logger } from "../lib/logger.js";

const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  serialize(value: unknown) {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "string") return value;
    return null;
  },
  parseValue(value: unknown) {
    if (typeof value === "string") return new Date(value);
    return null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  },
});

export type GatewayContext = YogaInitialContext & {
  userId: string | null;
};

function requireUser(ctx: GatewayContext): string {
  if (!ctx.userId) throw new Error("UNAUTHENTICATED");
  return ctx.userId;
}

const typeDefs = /* GraphQL */ `
  scalar DateTime

  type User {
    id: ID!
    email: String!
    fullName: String!
    image: String
    createdAt: DateTime!
  }

  type Deck {
    id: ID!
    userId: ID!
    name: String!
    description: String
    icon: String
    color: String
    defaultCadence: String
    sortOrder: Int!
    queueMode: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type VideoAnalysis {
    id: ID!
    videoId: ID!
    summary: String
    keyTakeaways: String
    suggestedTags: String
    difficulty: String
    recommendedDeckId: ID
    reviewQuestions: String
    estimatedValue: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Video {
    id: ID!
    userId: ID!
    deckId: ID!
    youtubeVideoId: String!
    title: String!
    description: String!
    channelTitle: String!
    thumbnailUrl: String
    durationSec: Int
    publishedAt: DateTime
    transcriptStatus: String!
    archived: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    analysis: VideoAnalysis
  }

  type Dashboard {
    totalVideos: Int!
    totalDecks: Int!
    reviewStreakDays: Int!
    topChannels: [ChannelStat!]!
    recentlySaved: [RecentVideo!]!
  }

  type ChannelStat {
    channelTitle: String!
    count: Int!
  }

  type RecentVideo {
    id: ID!
    deckName: String!
    channelTitle: String!
  }

  type Query {
    viewer: User
    decks: [Deck!]!
    deck(id: ID!): Deck
    videos(deckId: ID, q: String): [Video!]!
    video(id: ID!): Video
    dashboard: Dashboard!
    analytics: Dashboard!
  }

  type Mutation {
    createDeck(
      name: String!
      description: String
      icon: String
      color: String
      defaultCadence: String
      sortOrder: Int
      queueMode: String
    ): Deck!
    updateDeck(
      id: ID!
      name: String
      description: String
      icon: String
      color: String
      defaultCadence: String
      sortOrder: Int
      queueMode: String
    ): Deck!
    deleteDeck(id: ID!): Boolean!
    saveVideo(deckId: ID!, url: String!, fetchTranscript: Boolean): Video!
    analyzeVideo(videoId: ID!): VideoAnalysis!
    reviewVideo(deckId: ID!, videoId: ID!, action: ReviewAction!): Boolean!
    archiveVideo(videoId: ID!): Video!
    favoriteVideo(deckId: ID!, videoId: ID!): Boolean!
  }

  enum ReviewAction {
    VIEWED
    SKIP
    PIN
    FAVORITE
    ARCHIVE
  }
`;

export const resolvers = {
  DateTime: DateTimeScalar,
  Query: {
    viewer: async (_: unknown, __: unknown, ctx: GatewayContext) => {
      const uid = ctx.userId;
      if (!uid) return null;
      const res = await fetch(`${urls.AUTH_SERVICE_URL}/internal/users/${uid}`);
      if (res.status === 404) return null;
      const u = await j<{ id: string; email: string; fullName: string; image: string | null; createdAt: string }>(res);
      return u;
    },
    decks: async (_: unknown, __: unknown, ctx: GatewayContext) => {
      const uid = requireUser(ctx);
      const res = await fetch(`${urls.QUEUE_SERVICE_URL}/internal/decks?userId=${uid}`);
      const data = await j<{ items: unknown[] }>(res);
      return data.items;
    },
    deck: async (_: unknown, args: { id: string }, ctx: GatewayContext) => {
      requireUser(ctx);
      const res = await fetch(`${urls.QUEUE_SERVICE_URL}/internal/decks/${args.id}`);
      if (res.status === 404) return null;
      return j(res);
    },
    videos: async (_: unknown, args: { deckId?: string | null; q?: string | null }, ctx: GatewayContext) => {
      const uid = requireUser(ctx);
      const sp = new URLSearchParams({ userId: uid, limit: "100" });
      if (args.deckId) sp.set("deckId", args.deckId);
      if (args.q) sp.set("q", args.q);
      const res = await fetch(`${urls.VIDEO_SERVICE_URL}/internal/videos?${sp.toString()}`);
      const data = await j<{ items: Array<{ id: string }> }>(res);
      const items = data.items;
      const out = [];
      for (const v of items) {
        out.push(await mergeVideo(v.id));
      }
      return out;
    },
    video: async (_: unknown, args: { id: string }, ctx: GatewayContext) => {
      requireUser(ctx);
      return mergeVideo(args.id);
    },
    dashboard: async (_: unknown, __: unknown, ctx: GatewayContext) => {
      const uid = requireUser(ctx);
      const res = await fetch(`${urls.ANALYTICS_SERVICE_URL}/internal/dashboard?userId=${uid}`);
      return j(res);
    },
    analytics: async (_: unknown, __: unknown, ctx: GatewayContext) => {
      const uid = requireUser(ctx);
      const res = await fetch(`${urls.ANALYTICS_SERVICE_URL}/internal/dashboard?userId=${uid}`);
      return j(res);
    },
  },
  Mutation: {
    createDeck: async (_: unknown, args: Record<string, unknown>, ctx: GatewayContext) => {
      const uid = requireUser(ctx);
      const res = await fetch(`${urls.QUEUE_SERVICE_URL}/internal/decks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, ...args }),
      });
      return j(res);
    },
    updateDeck: async (_: unknown, args: { id: string } & Record<string, unknown>, ctx: GatewayContext) => {
      const uid = requireUser(ctx);
      const { id, ...rest } = args;
      const res = await fetch(`${urls.QUEUE_SERVICE_URL}/internal/decks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, ...rest }),
      });
      return j(res);
    },
    deleteDeck: async (_: unknown, args: { id: string }, ctx: GatewayContext) => {
      const uid = requireUser(ctx);
      const res = await fetch(
        `${urls.QUEUE_SERVICE_URL}/internal/decks/${args.id}?userId=${encodeURIComponent(uid)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("delete_failed");
      return true;
    },
    saveVideo: async (
      _: unknown,
      args: { deckId: string; url: string; fetchTranscript?: boolean | null },
      ctx: GatewayContext,
    ) => {
      const uid = requireUser(ctx);
      const deckRes = await fetch(`${urls.QUEUE_SERVICE_URL}/internal/decks/${args.deckId}`);
      if (!deckRes.ok) throw new Error("deck_not_found");
      const deck = await j<{ userId: string }>(deckRes);
      if (deck.userId !== uid) throw new Error("forbidden");

      const res = await fetch(`${urls.VIDEO_SERVICE_URL}/internal/videos/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          deckId: args.deckId,
          url: args.url,
          fetchTranscript: args.fetchTranscript ?? true,
        }),
      });
      const video = await j<{
        id: string;
        deckId: string;
        youtubeVideoId: string;
      }>(res);

      await fetch(`${urls.QUEUE_SERVICE_URL}/internal/queue/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: video.deckId, videoId: video.id }),
      }).catch((e) => logger.warn({ e }, "queue append failed"));

      return mergeVideo(video.id);
    },
    analyzeVideo: async (_: unknown, args: { videoId: string }, ctx: GatewayContext) => {
      const uid = requireUser(ctx);
      const vRes = await fetch(`${urls.VIDEO_SERVICE_URL}/internal/videos/${args.videoId}`);
      if (!vRes.ok) throw new Error("video_not_found");
      const video = await j<{
        userId: string;
        title: string;
        channelTitle: string;
        description: string;
        transcriptText: string | null;
        transcriptStatus: string;
      }>(vRes);
      if (video.userId !== uid) throw new Error("forbidden");

      const decksRes = await fetch(`${urls.QUEUE_SERVICE_URL}/internal/decks?userId=${uid}`);
      const decksJson = await j<{ items: Array<{ id: string; name: string }> }>(decksRes);
      const text =
        video.transcriptText?.trim() ||
        `${video.title}\n${video.description}`.slice(0, 8000);

      const aRes = await fetch(`${urls.ANALYSIS_SERVICE_URL}/internal/analysis/digest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: args.videoId,
          title: video.title,
          channelTitle: video.channelTitle,
          text,
          decks: decksJson.items.map((d) => ({ id: d.id, name: d.name })),
        }),
      });
      return j(aRes);
    },
    reviewVideo: async (
      _: unknown,
      args: { deckId: string; videoId: string; action: string },
      ctx: GatewayContext,
    ) => {
      const uid = requireUser(ctx);
      const res = await fetch(`${urls.QUEUE_SERVICE_URL}/internal/queue/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, deckId: args.deckId, videoId: args.videoId, action: args.action }),
      });
      if (!res.ok) throw new Error("review_failed");
      return true;
    },
    archiveVideo: async (_: unknown, args: { videoId: string }, ctx: GatewayContext) => {
      const uid = requireUser(ctx);
      const res = await fetch(`${urls.VIDEO_SERVICE_URL}/internal/videos/${args.videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, archived: true }),
      });
      const video = await j(res);
      const v = video as { deckId: string; id: string };
      await fetch(`${urls.QUEUE_SERVICE_URL}/internal/queue/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          deckId: v.deckId,
          videoId: v.id,
          action: "ARCHIVE",
        }),
      }).catch(() => {});
      return mergeVideo(v.id);
    },
    favoriteVideo: async (_: unknown, args: { deckId: string; videoId: string }, ctx: GatewayContext) => {
      const uid = requireUser(ctx);
      const res = await fetch(`${urls.QUEUE_SERVICE_URL}/internal/queue/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: uid,
          deckId: args.deckId,
          videoId: args.videoId,
          action: "FAVORITE",
        }),
      });
      if (!res.ok) throw new Error("favorite_failed");
      return true;
    },
  },
};

async function mergeVideo(id: string) {
  const vRes = await fetch(`${urls.VIDEO_SERVICE_URL}/internal/videos/${id}`);
  if (!vRes.ok) throw new Error("video_not_found");
  const video = await j<Record<string, unknown>>(vRes);
  const aRes = await fetch(`${urls.ANALYSIS_SERVICE_URL}/internal/analysis/${id}`);
  let analysis = null;
  if (aRes.ok) {
    analysis = await aRes.json();
  }
  return { ...video, analysis };
}

export { typeDefs };
