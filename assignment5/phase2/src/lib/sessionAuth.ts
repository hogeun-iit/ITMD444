import type { FastifyReply, FastifyRequest } from "fastify";

/** 401 when no session user. */
export async function requireSession(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const userId = req.session.get("userId");
  if (!userId) {
    await reply.code(401).send({
      error: "unauthorized",
      message: "Sign in required (session cookie)",
    });
    return;
  }
}
