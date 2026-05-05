import DataLoader from "dataloader";
import type { FastifyReply, FastifyRequest } from "fastify";
import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import { prisma } from "../lib/prisma";
import { getPipelineStatus } from "../services/pipelineService";
import { getRecommendationsForUser } from "../services/recommendationsService";
import { createVideo, deleteVideo, getVideo, updateVideo } from "../services/videoService";
import { updateVideoBodySchema } from "../schemas/video";

type SortOrder = "CREATED_AT_DESC" | "CREATED_AT_ASC";
type ReviewAction = "VIEWED" | "SKIP" | "PIN" | "FAVORITE" | "ARCHIVE";

export type GraphqlContext = {
  req: FastifyRequest;
  reply: FastifyReply;
  userId: string | null;
  loaders: {
    deckById: DataLoader<string, { id: string; name: string; userId: string } | null>;
    userById: DataLoader<string, { id: string; email: string; fullName: string } | null>;
  };
};

export const typeDefs = /* GraphQL */ `
  scalar DateTime

  type User {
    id: ID!
    email: String!
    fullName: String!
  }

  type Deck {
    id: ID!
    name: String!
    userId: ID!
  }

  type VideoAnalysis {
    id: ID!
    summary: String
    keyTakeaways: String
    difficulty: String
    recommendedDeckId: ID
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
    deck: Deck!
    user: User!
    analysis: VideoAnalysis
  }

  type VideoConnection {
    items: [Video!]!
    nextCursor: String
    hasNextPage: Boolean!
  }

  type RecommendationItem {
    videoId: ID!
    deckId: ID!
    deckName: String!
    title: String!
    youtubeVideoId: String!
    queueOrder: Int!
    pinned: Boolean!
    favoriteRank: Int!
    reason: String!
    recommendedDeckIdFromDigest: ID
  }

  type RecommendationPayload {
    note: String!
    items: [RecommendationItem!]!
  }

  type PipelineStage {
    id: String!
    status: String!
    at: DateTime
    detail: String
  }

  type PipelineExternalRefs {
    youtubeVideoId: String!
    openaiModel: String
  }

  type PipelineStatus {
    videoId: ID!
    transcriptStatus: String!
    stages: [PipelineStage!]!
    lastError: String
    digestCompletedAt: DateTime
    externalRefs: PipelineExternalRefs!
  }

  type SaveVideoPayload {
    id: ID!
    userId: ID!
    deckId: ID!
    youtubeVideoId: String!
    title: String!
    channelTitle: String!
    transcriptStatus: String!
    createdAt: DateTime!
    analysisId: ID
  }

  type UpdateVideoPayload {
    id: ID!
    userId: ID!
    deckId: ID!
    transcriptStatus: String!
    archived: Boolean!
    updatedAt: DateTime!
  }

  type DeleteVideoPayload {
    ok: Boolean!
  }

  input SaveVideoInput {
    userId: ID!
    deckId: ID!
    youtubeUrl: String!
  }

  input UpdateVideoInput {
    transcriptStatus: String
    deckId: ID
    archived: Boolean
  }

  input UserVideosInput {
    userId: ID!
    first: Int = 20
    after: String
    includeArchived: Boolean = false
    sort: String = "CREATED_AT_DESC"
  }

  type Query {
    viewer: User!
    userVideos(input: UserVideosInput!): VideoConnection!
    video(videoId: ID!): Video!
    pipelineStatus(videoId: ID!): PipelineStatus!
    recommendations(userId: ID!, limit: Int = 20): RecommendationPayload!
  }

  type Mutation {
    saveVideo(input: SaveVideoInput!): SaveVideoPayload!
    updateVideo(videoId: ID!, input: UpdateVideoInput!): UpdateVideoPayload!
    deleteVideo(videoId: ID!): DeleteVideoPayload!
    reviewVideo(videoId: ID!, action: String!): UpdateVideoPayload!
  }
`;

function requireAuth(ctx: GraphqlContext): string {
  if (!ctx.userId) throw new GraphQLError("Unauthorized", { extensions: { code: "UNAUTHORIZED" } });
  return ctx.userId;
}

function requireOwner(sessionUid: string, ownerUid: string): void {
  if (sessionUid !== ownerUid) {
    throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
  }
}

function decodeCursor(cursor?: string | null): string | null {
  if (!cursor) return null;
  try {
    return Buffer.from(cursor, "base64").toString("utf8");
  } catch {
    throw new GraphQLError("Invalid cursor", { extensions: { code: "BAD_USER_INPUT" } });
  }
}

function encodeCursor(v: string): string {
  return Buffer.from(v, "utf8").toString("base64");
}

async function loadVideoOwnedBy(sessionUid: string, videoId: string) {
  const row = await getVideo(videoId);
  if (row.type === "not_found") {
    throw new GraphQLError("Video not found", { extensions: { code: "NOT_FOUND" } });
  }
  requireOwner(sessionUid, row.data.userId);
  return row.data;
}

async function applyReviewAction(videoId: string, action: ReviewAction) {
  const existing = await prisma.video.findUnique({ where: { id: videoId } });
  if (!existing) {
    throw new GraphQLError("Video not found", { extensions: { code: "NOT_FOUND" } });
  }

  const data: Record<string, unknown> = {};
  if (action === "ARCHIVE") {
    data.archived = true;
  } else if (action === "PIN") {
    data.pinned = true;
  } else if (action === "FAVORITE") {
    data.favoriteRank = { increment: 1 };
  } else if (action === "SKIP") {
    data.queueOrder = existing.queueOrder + 100;
  } else if (action === "VIEWED") {
    data.queueOrder = existing.queueOrder + 1000;
  }

  await prisma.video.update({ where: { id: videoId }, data });
}

const dateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  serialize(value: unknown) {
    if (value instanceof Date) return value.toISOString();
    return String(value);
  },
  parseValue(value: unknown) {
    return value instanceof Date ? value : new Date(String(value));
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return new Date(ast.value);
    return null;
  },
});

export const resolvers = {
  DateTime: dateTimeScalar,

  Query: {
    viewer: async (_: unknown, __: unknown, ctx: GraphqlContext) => {
      const userId = requireAuth(ctx);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
      return user;
    },

    userVideos: async (_: unknown, args: { input: { userId: string; first?: number; after?: string; includeArchived?: boolean; sort?: SortOrder } }, ctx: GraphqlContext) => {
      const sessionUid = requireAuth(ctx);
      const userId = args.input.userId;
      requireOwner(sessionUid, userId);

      const first = Math.min(Math.max(args.input.first ?? 20, 1), 100);
      const includeArchived = args.input.includeArchived ?? false;
      const sort = args.input.sort ?? "CREATED_AT_DESC";
      const after = decodeCursor(args.input.after);

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });

      const where: { deck: { userId: string }; archived?: boolean; createdAt?: { lt?: Date; gt?: Date } } = {
        deck: { userId },
      };
      if (!includeArchived) where.archived = false;
      if (after) {
        const d = new Date(after);
        if (Number.isNaN(d.getTime())) throw new GraphQLError("Invalid cursor", { extensions: { code: "BAD_USER_INPUT" } });
        where.createdAt = sort === "CREATED_AT_ASC" ? { gt: d } : { lt: d };
      }

      const rows = await prisma.video.findMany({
        where,
        orderBy: { createdAt: sort === "CREATED_AT_ASC" ? "asc" : "desc" },
        take: first + 1,
      });

      const hasNextPage = rows.length > first;
      const items = rows.slice(0, first).map((v) => ({
        id: v.id,
        userId,
        deckId: v.deckId,
        youtubeVideoId: v.youtubeVideoId,
        title: v.title,
        description: v.description,
        channelTitle: v.channelTitle,
        thumbnailUrl: v.thumbnailUrl,
        durationSec: v.durationSec,
        publishedAt: v.publishedAt?.toISOString() ?? null,
        transcriptStatus: v.transcriptStatus,
        archived: v.archived,
        createdAt: v.createdAt.toISOString(),
        updatedAt: v.updatedAt.toISOString(),
      }));

      return {
        items,
        hasNextPage,
        nextCursor: hasNextPage ? encodeCursor(items[items.length - 1].createdAt) : null,
      };
    },

    video: async (_: unknown, args: { videoId: string }, ctx: GraphqlContext) => {
      const sessionUid = requireAuth(ctx);
      return loadVideoOwnedBy(sessionUid, args.videoId);
    },

    pipelineStatus: async (_: unknown, args: { videoId: string }, ctx: GraphqlContext) => {
      const sessionUid = requireAuth(ctx);
      await loadVideoOwnedBy(sessionUid, args.videoId);
      const status = await getPipelineStatus(args.videoId);
      if (!status) throw new GraphQLError("Video not found", { extensions: { code: "NOT_FOUND" } });
      return status;
    },

    recommendations: async (_: unknown, args: { userId: string; limit?: number }, ctx: GraphqlContext) => {
      const sessionUid = requireAuth(ctx);
      requireOwner(sessionUid, args.userId);
      return getRecommendationsForUser(args.userId, args.limit ?? 20);
    },
  },

  Mutation: {
    saveVideo: async (_: unknown, args: { input: { userId: string; deckId: string; youtubeUrl: string } }, ctx: GraphqlContext) => {
      const sessionUid = requireAuth(ctx);
      requireOwner(sessionUid, args.input.userId);
      const result = await createVideo(args.input);
      if (result.type === "user_not_found") throw new GraphQLError("User not found", { extensions: { code: "NOT_FOUND" } });
      if (result.type === "deck_not_found") throw new GraphQLError("Deck not found", { extensions: { code: "NOT_FOUND" } });
      if (result.type === "invalid_youtube_url") throw new GraphQLError("Invalid YouTube URL", { extensions: { code: "BAD_USER_INPUT" } });
      if (result.type === "duplicate_video") throw new GraphQLError("Duplicate video in deck", { extensions: { code: "CONFLICT" } });
      return result.data;
    },

    updateVideo: async (_: unknown, args: { videoId: string; input: { transcriptStatus?: string; deckId?: string; archived?: boolean } }, ctx: GraphqlContext) => {
      const sessionUid = requireAuth(ctx);
      await loadVideoOwnedBy(sessionUid, args.videoId);
      let input;
      try {
        input = updateVideoBodySchema.parse(args.input);
      } catch {
        throw new GraphQLError("Invalid update input", { extensions: { code: "BAD_USER_INPUT" } });
      }
      const result = await updateVideo(args.videoId, input);
      if (result.type === "not_found") throw new GraphQLError("Video not found", { extensions: { code: "NOT_FOUND" } });
      if (result.type === "deck_not_found") throw new GraphQLError("Deck not found", { extensions: { code: "NOT_FOUND" } });
      return result.data;
    },

    deleteVideo: async (_: unknown, args: { videoId: string }, ctx: GraphqlContext) => {
      const sessionUid = requireAuth(ctx);
      await loadVideoOwnedBy(sessionUid, args.videoId);
      const result = await deleteVideo(args.videoId);
      if (result.type === "not_found") throw new GraphQLError("Video not found", { extensions: { code: "NOT_FOUND" } });
      return { ok: true };
    },

    reviewVideo: async (_: unknown, args: { videoId: string; action: ReviewAction }, ctx: GraphqlContext) => {
      const sessionUid = requireAuth(ctx);
      await loadVideoOwnedBy(sessionUid, args.videoId);
      const action = args.action.toUpperCase() as ReviewAction;
      if (!(["VIEWED", "SKIP", "PIN", "FAVORITE", "ARCHIVE"] as const).includes(action)) {
        throw new GraphQLError("Unknown review action", { extensions: { code: "BAD_USER_INPUT" } });
      }
      await applyReviewAction(args.videoId, action);
      const out = await updateVideo(args.videoId, {});
      if (out.type !== "ok") throw new GraphQLError("Video not found", { extensions: { code: "NOT_FOUND" } });
      return out.data;
    },
  },

  Video: {
    deck: (parent: { deckId: string }, _: unknown, ctx: GraphqlContext) => ctx.loaders.deckById.load(parent.deckId),
    user: (parent: { userId: string }, _: unknown, ctx: GraphqlContext) => ctx.loaders.userById.load(parent.userId),
  },
};

export function buildContext(req: FastifyRequest, reply: FastifyReply): GraphqlContext {
  const userId = req.session.get("userId") ?? null;

  return {
    req,
    reply,
    userId,
    loaders: {
      deckById: new DataLoader(async (ids) => {
        const rows = await prisma.deck.findMany({
          where: { id: { in: [...ids] } },
          select: { id: true, name: true, userId: true },
        });
        const map = new Map(rows.map((r) => [r.id, r]));
        return ids.map((id) => map.get(id) ?? null);
      }),
      userById: new DataLoader(async (ids) => {
        const rows = await prisma.user.findMany({
          where: { id: { in: [...ids] } },
          select: { id: true, email: true, fullName: true },
        });
        const map = new Map(rows.map((r) => [r.id, r]));
        return ids.map((id) => map.get(id) ?? null);
      }),
    },
  };
}
