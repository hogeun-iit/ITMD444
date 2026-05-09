import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { runGraphql } from "@/lib/graphql";
import Link from "next/link";

const DASHBOARD = /* GraphQL */ `
  query Dashboard {
    dashboard {
      totalVideos
      totalDecks
      reviewStreakDays
      topChannels {
        channelTitle
        count
      }
      recentlySaved {
        id
        deckName
        channelTitle
      }
    }
  }
`;

type DashboardData = {
  dashboard: {
    totalVideos: number;
    totalDecks: number;
    reviewStreakDays: number;
    topChannels: { channelTitle: string; count: number }[];
    recentlySaved: { id: string; deckName: string; channelTitle: string }[];
  };
};

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let error: string | null = null;
  let data: DashboardData | null = null;

  try {
    data = await runGraphql<DashboardData>(DASHBOARD);
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  if (error) {
    return (
      <main>
        <h1>Dashboard</h1>
        <div className="card">
          <p>Could not reach the backend: {error}</p>
          <p className="muted">
            Check that Postgres migrations, the gateway, and microservices are running.
          </p>
        </div>
      </main>
    );
  }

  const d = data!.dashboard;

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="row">
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <div className="muted">Saved videos</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{d.totalVideos}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <div className="muted">Decks</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{d.totalDecks}</div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: 200 }}>
          <div className="muted">Review streak (days)</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{d.reviewStreakDays}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Saves by channel</h2>
        <ul>
          {d.topChannels.map((c) => (
            <li key={c.channelTitle}>
              {c.channelTitle}: {c.count}
            </li>
          ))}
          {d.topChannels.length === 0 && <li className="muted">No data yet.</li>}
        </ul>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Recently saved</h2>
        <ul>
          {d.recentlySaved.map((v) => (
            <li key={v.id}>
              <Link href={`/videos#${v.id}`}>
                {v.deckName} — {v.channelTitle}
              </Link>
            </li>
          ))}
          {d.recentlySaved.length === 0 && <li className="muted">Save a video to get started.</li>}
        </ul>
      </div>
    </main>
  );
}
