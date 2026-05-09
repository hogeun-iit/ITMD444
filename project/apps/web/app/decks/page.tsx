import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { runGraphql } from "@/lib/graphql";
import { createDeckAction, deleteDeckFormAction } from "./actions";

const DECKS = /* GraphQL */ `
  query Decks {
    decks {
      id
      name
      description
      sortOrder
      createdAt
    }
  }
`;

type DecksData = {
  decks: Array<{ id: string; name: string; description: string | null; sortOrder: number; createdAt: string }>;
};

export default async function DecksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let decks: DecksData["decks"] = [];
  let error: string | null = null;
  try {
    const data = await runGraphql<DecksData>(DECKS);
    decks = data.decks;
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  return (
    <main>
      <h1>Decks</h1>
      {error && <p className="muted">{error}</p>}

      <div className="card">
        <h2 style={{ marginTop: 0 }}>New deck</h2>
        <form action={createDeckAction}>
          <label className="muted">Name</label>
          <input name="name" required placeholder="e.g. Backend" />
          <label className="muted" style={{ display: "block", marginTop: "0.75rem" }}>
            Description
          </label>
          <textarea name="description" rows={2} placeholder="Optional" />
          <div style={{ marginTop: "0.75rem" }}>
            <button type="submit">Create</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Your decks</h2>
        <ul style={{ paddingLeft: "1.25rem" }}>
          {decks.map((d) => (
            <li key={d.id} id={d.id} style={{ marginBottom: "0.5rem" }}>
              <strong>{d.name}</strong>
              {d.description && <span className="muted"> — {d.description}</span>}
              <form action={deleteDeckFormAction} style={{ display: "inline", marginLeft: "0.5rem" }}>
                <input type="hidden" name="id" value={d.id} />
                <button type="submit" className="secondary">
                  Delete
                </button>
              </form>
            </li>
          ))}
          {decks.length === 0 && <li className="muted">No decks yet. Create one above.</li>}
        </ul>
      </div>
    </main>
  );
}
