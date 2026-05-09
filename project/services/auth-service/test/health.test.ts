import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("auth-service", () => {
  it("health", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).ok).toBe(true);
    await app.close();
  });
});
