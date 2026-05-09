import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { doSignIn } from "@/app/actions/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main>
      <h1>Sign in</h1>
      <p className="muted">Sign in to TubeDeck with your Google account (Auth.js).</p>
      <form action={doSignIn}>
        <button type="submit">Continue with Google</button>
      </form>
      <p className="muted" style={{ marginTop: "1.5rem" }}>
        Set `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET` in `.env`.
      </p>
    </main>
  );
}
