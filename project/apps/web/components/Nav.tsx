import Link from "next/link";
import { auth } from "@/auth";
import { doSignOut } from "@/app/actions/auth";

export async function Nav() {
  const session = await auth();

  return (
    <nav className="nav row">
      <Link href="/">Dashboard</Link>
      <Link href="/decks">Decks</Link>
      <Link href="/videos">Videos</Link>
      {session?.user ? (
        <form action={doSignOut} style={{ marginLeft: "auto" }}>
          <button type="submit" className="secondary">
            Sign out ({session.user.email})
          </button>
        </form>
      ) : (
        <Link href="/login" style={{ marginLeft: "auto" }}>
          Sign in
        </Link>
      )}
    </nav>
  );
}
