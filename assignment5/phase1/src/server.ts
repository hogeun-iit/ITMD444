import "dotenv/config";
import { buildApp } from "./app";

const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3000);

async function main() {
  const app = await buildApp();
  await app.listen({ host, port });
  app.log.info(`listening on http://${host}:${port} — docs at http://${host}:${port}/docs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
