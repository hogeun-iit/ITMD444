import "./types/fastify-session-augment";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import Fastify from "fastify";
import { authRoutes } from "./routes/auth";
import { userVideoRoutes } from "./routes/users";
import { videoRoutes } from "./routes/videos";

function sessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set to a string at least 32 characters long");
  }
  return "dev-only-session-secret-not-for-production-xx";
}

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
  });

  await app.register(cookie);
  await app.register(session, {
    secret: sessionSecret(),
    cookieName: "sessionId",
    cookie: {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    },
  });

  await app.register(swagger, {
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "TubeDeck ? Phase 1 (REST)",
        description:
          "`backend-dev-api.md`: `/users/{userId}/videos`, `/videos`, session cookie auth, PostgreSQL + Prisma.",
        version: "1.0.0",
      },
      tags: [
        { name: "health", description: "Liveness" },
        { name: "auth", description: "Session cookie login (demo email lookup)" },
        { name: "users", description: "Per-user video lists" },
        { name: "videos", description: "Saved YouTube imports" },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });

  app.addHook("onResponse", async (request, reply) => {
    request.log.info({
      msg: "request_completed",
      method: request.method,
      route: request.routeOptions.url ?? request.url,
      statusCode: reply.statusCode,
      responseTimeMs: reply.elapsedTime,
    });
  });

  app.get(
    "/health",
    {
      schema: {
        summary: "Health check",
        tags: ["health"],
        response: {
          200: {
            type: "object",
            properties: {
              ok: { type: "boolean" },
            },
          },
        },
      },
    },
    async () => ({ ok: true }),
  );

  await app.register(authRoutes);
  await app.register(userVideoRoutes);
  await app.register(videoRoutes);

  return app;
}
