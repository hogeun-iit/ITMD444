import { z } from "zod";

const env = z.object({
  AUTH_SERVICE_URL: z.string().default("http://127.0.0.1:4001"),
  QUEUE_SERVICE_URL: z.string().default("http://127.0.0.1:4002"),
  VIDEO_SERVICE_URL: z.string().default("http://127.0.0.1:4003"),
  ANALYSIS_SERVICE_URL: z.string().default("http://127.0.0.1:4004"),
  ANALYTICS_SERVICE_URL: z.string().default("http://127.0.0.1:4005"),
});

export const urls = env.parse(process.env);

export async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`upstream_${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}
