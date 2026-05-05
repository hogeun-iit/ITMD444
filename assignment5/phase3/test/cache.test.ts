import { describe, expect, it } from "vitest";
import { cacheGet, cacheSet } from "../src/lib/cache";

describe("in-memory cache", () => {
  it("stores and retrieves until TTL passes", () => {
    cacheSet("phase2", { ok: true }, 60_000);
    expect(cacheGet<{ ok: boolean }>("phase2")).toEqual({ ok: true });
  });
});
