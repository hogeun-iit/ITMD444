/** Augment `@fastify/session` session payload. Must be imported once (see `server.ts`). */
export {};

declare module "fastify" {
  interface Session {
    /** Logged-in TubeDeck user id (`users.id`). */
    userId?: string;
  }
}
