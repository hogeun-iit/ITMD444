"use server";

import { revalidatePath } from "next/cache";
import { runGraphql } from "@/lib/graphql";

const CREATE = /* GraphQL */ `
  mutation CreateDeck($name: String!, $description: String) {
    createDeck(name: $name, description: $description) {
      id
      name
    }
  }
`;

const DELETE = /* GraphQL */ `
  mutation DeleteDeck($id: ID!) {
    deleteDeck(id: $id)
  }
`;

export async function createDeckAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!name) throw new Error("Please enter a name.");
  await runGraphql(CREATE, { name, description });
  revalidatePath("/decks");
}

export async function deleteDeckFormAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("missing id");
  await runGraphql(DELETE, { id });
  revalidatePath("/decks");
}
