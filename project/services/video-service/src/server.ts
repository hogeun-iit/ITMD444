import "dotenv/config";
import { buildApp } from "./app.js";

const port = Number(process.env.PORT ?? 4003);
const app = await buildApp();
await app.listen({ port, host: "0.0.0.0" });
app.log.info({ port }, "video-service listening");
