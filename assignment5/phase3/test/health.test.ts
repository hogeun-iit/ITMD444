import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app";

describe("GET /health", () => {
  it("returns ok without auth", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true });
    await app.close();
  });
});
