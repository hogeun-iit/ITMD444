"use server";

import { auth } from "@/auth";

const gatewayUrl = process.env.GATEWAY_URL ?? "http://127.0.0.1:4000";

export async function runGraphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) throw new Error("You must be signed in.");

  const res = await fetch(`${gatewayUrl}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": uid,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (!res.ok || body.errors?.length) {
    throw new Error(body.errors?.[0]?.message ?? `GraphQL error (${res.status})`);
  }
  if (body.data === undefined) throw new Error("Empty GraphQL response.");
  return body.data;
}
