import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("analytics-service", () => {
  it("health", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    await app.close();
  });
});
