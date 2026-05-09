import "dotenv/config";
import { createServer } from "node:http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createYoga } from "graphql-yoga";
import { typeDefs, resolvers, type GatewayContext } from "./graphql/schema.js";
import { logger } from "./lib/logger.js";

const port = Number(process.env.PORT ?? 4000);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const yoga = createYoga<GatewayContext>({
  schema,
  graphqlEndpoint: "/graphql",
  landingPage: true,
  logging: {
    debug: (...args) => logger.debug(args),
    info: (...args) => logger.info(args),
    warn: (...args) => logger.warn(args),
    error: (...args) => logger.error(args),
  },
  context: async ({ request }): Promise<GatewayContext> => {
    const userId = request.headers.get("x-user-id");
    return {
      request,
      userId: userId && /^[0-9a-f-]{36}$/i.test(userId) ? userId : null,
    } as GatewayContext;
  },
});

const server = createServer(yoga);
server.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "gateway GraphQL listening");
});
