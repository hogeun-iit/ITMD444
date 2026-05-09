import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { runGraphql } from "@/lib/graphql";
import { analyzeVideoFormAction, reviewFormAction, saveVideoAction } from "./actions";

const DATA = /* GraphQL */ `
  query VideosPage {
    decks {
      id
      name
    }
    videos {
      id
      deckId
      title
      channelTitle
      youtubeVideoId
      transcriptStatus
      archived
      analysis {
        summary
        difficulty
      }
    }
  }
`;

type VideosData = {
  decks: Array<{ id: string; name: string }>;
  videos: Array<{
    id: string;
    deckId: string;
    title: string;
    channelTitle: string;
    youtubeVideoId: string;
    transcriptStatus: string;
    archived: boolean;
    analysis: { summary: string | null; difficulty: string | null } | null;
  }>;
};

export default async function VideosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let data: VideosData | null = null;
  let error: string | null = null;
  try {
    data = await runGraphql<VideosData>(DATA);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  return (
    <main>
      <h1>Videos</h1>
      {error && <p className="muted">{error}</p>}

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Save a YouTube URL</h2>
        <form action={saveVideoAction}>
          <label className="muted">Deck</label>
          <select name="deckId" required defaultValue="">
            <option value="" disabled>
              Choose…
            </option>
            {data?.decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <label className="muted" style={{ display: "block", marginTop: "0.75rem" }}>
            URL
          </label>
          <input name="url" placeholder="https://www.youtube.com/watch?v=..." required />
          <label className="row" style={{ marginTop: "0.75rem" }}>
            <input type="checkbox" name="fetchTranscript" defaultChecked />
            <span className="muted">Fetch captions / transcript</span>
          </label>
          <div style={{ marginTop: "0.75rem" }}>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>List</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {(data?.videos ?? []).map((v) => (
            <li key={v.id} id={v.id} className="card" style={{ background: "#131b26" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <strong>{v.title}</strong>
                  <div className="muted">
                    {v.channelTitle} · {v.transcriptStatus}
                    {v.archived && " · Archived"}
                  </div>
                  <div className="muted">
                    <a
                      href={`https://www.youtube.com/watch?v=${v.youtubeVideoId}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open on YouTube
                    </a>
                  </div>
                  {v.analysis?.summary && (
                    <p style={{ marginTop: "0.5rem" }}>
                      <span className="muted">Summary: </span>
                      {v.analysis.summary.slice(0, 280)}
                      {v.analysis.summary.length > 280 ? "…" : ""}
                    </p>
                  )}
                </div>
                <div className="row">
                  <form action={analyzeVideoFormAction}>
                    <input type="hidden" name="videoId" value={v.id} />
                    <button type="submit" className="secondary">
                      AI analyze
                    </button>
                  </form>
                  <form action={reviewFormAction}>
                    <input type="hidden" name="deckId" value={v.deckId} />
                    <input type="hidden" name="videoId" value={v.id} />
                    <input type="hidden" name="action" value="VIEWED" />
                    <button type="submit" className="secondary">
                      Viewed
                    </button>
                  </form>
                  <form action={reviewFormAction}>
                    <input type="hidden" name="deckId" value={v.deckId} />
                    <input type="hidden" name="videoId" value={v.id} />
                    <input type="hidden" name="action" value="PIN" />
                    <button type="submit" className="secondary">
                      Pin
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
          {(data?.videos ?? []).length === 0 && <li className="muted">No saved videos yet.</li>}
        </ul>
      </div>
    </main>
  );
}
