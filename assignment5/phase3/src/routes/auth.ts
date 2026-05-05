import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { sendZodError } from "../lib/errors";

const loginBodySchema = z.object({
  /** Passwordless Phase 1 demo — finds user by email and opens a signed session cookie. */
  email: z.string().email(),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/auth/login",
    {
      schema: {
        tags: ["auth"],
        summary: "Sign in (demo: email-only)",
        description:
          "Creates a session cookie scoped to `users.id`. Intended for coursework; replace with OAuth/password in production.",
        body: {
          type: "object",
          required: ["email"],
          properties: { email: { type: "string", format: "email" } },
        },
      },
    },
    async (req, reply) => {
      try {
        const body = loginBodySchema.parse(req.body);
        const user = await prisma.user.findUnique({ where: { email: body.email } });
        if (!user) {
          return reply.code(401).send({
            error: "invalid_credentials",
            message: "Unknown email",
          });
        }
        req.session.set("userId", user.id);
        await req.session.save();
        return reply.send({
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
        });
      } catch (err) {
        if (err instanceof z.ZodError) return sendZodError(reply, err);
        throw err;
      }
    },
  );

  app.post(
    "/auth/logout",
    {
      schema: {
        tags: ["auth"],
        summary: "Destroy session",
        response: { 204: { type: "null", description: "No content" } },
      },
    },
    async (req, reply) => {
      await req.session.destroy();
      return reply.code(204).send();
    },
  );

  app.get(
    "/auth/me",
    {
      schema: {
        tags: ["auth"],
        summary: "Current session user",
      },
    },
    async (req, reply) => {
      const userId = req.session.get("userId");
      if (!userId) {
        return reply.code(401).send({
          error: "unauthorized",
          message: "No active session",
        });
      }
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, fullName: true },
      });
      if (!user) {
        await req.session.destroy();
        return reply.code(401).send({
          error: "unauthorized",
          message: "Session user no longer exists",
        });
      }
      return reply.send({
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
      });
    },
  );
};
