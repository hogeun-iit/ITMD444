import fastifyApollo, { fastifyApolloDrainPlugin } from "@as-integrations/fastify";
import { ApolloServer } from "@apollo/server";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { buildContext, resolvers, typeDefs } from "./schema";

export async function registerGraphql(app: FastifyInstance) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin(app)],
  });

  await server.start();

  await app.register(fastifyApollo(server), {
    path: "/graphql",
    context: async (request: FastifyRequest, reply: FastifyReply) => buildContext(request, reply),
  });
}
