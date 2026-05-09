import Fastify from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma.js";
import { logger } from "./lib/logger.js";

const upsertBody = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  googleSub: z.string().optional(),
  image: z.string().url().optional().nullable(),
});

export async function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  app.get("/health", async () => ({ ok: true, service: "auth-service" }));

  app.post("/internal/users/sync", async (req, reply) => {
    const parsed = upsertBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "invalid_body", details: parsed.error.flatten() });
    }
    const { email, fullName, googleSub, image } = parsed.data;
    const user = await prisma.user.upsert({
      where: googleSub ? { googleSub } : { email },
      create: {
        email,
        fullName,
        googleSub: googleSub ?? null,
        image: image ?? null,
      },
      update: { fullName, email, image: image ?? undefined },
    });
    return { id: user.id, email: user.email, fullName: user.fullName, image: user.image };
  });

  app.get("/internal/users/:id", async (req, reply) => {
    const id = (req.params as { id: string }).id;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return reply.status(404).send({ error: "not_found" });
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
    };
  });

  return app;
}
