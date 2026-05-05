import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app";

describe("POST /graphql", () => {
  it("returns viewer after login", async () => {
    const app = await buildApp();

    const login = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "alice@example.com" },
    });
    expect(login.statusCode).toBe(200);
    const cookie = login.headers["set-cookie"];
    expect(cookie).toBeTruthy();

    const gql = await app.inject({
      method: "POST",
      url: "/graphql",
      headers: { cookie: Array.isArray(cookie) ? cookie[0] : cookie ?? "" },
      payload: {
        query: "query { viewer { id email fullName } }",
      },
    });

    expect(gql.statusCode).toBe(200);
    const body = JSON.parse(gql.body) as {
      data?: { viewer?: { email?: string } };
      errors?: unknown[];
    };
    expect(body.errors).toBeUndefined();
    expect(body.data?.viewer?.email).toBe("alice@example.com");

    await app.close();
  });
});
