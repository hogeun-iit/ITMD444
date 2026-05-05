import type { FastifyReply } from "fastify";
import { ZodError } from "zod";

export function sendZodError(reply: FastifyReply, err: ZodError) {
  return reply.code(400).send({
    error: "validation_error",
    message: "Invalid request",
    details: err.flatten(),
  });
}

