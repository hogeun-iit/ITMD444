import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const authServiceUrl = process.env.AUTH_SERVICE_URL ?? "http://127.0.0.1:4001";

/** Google Cloud Console values; also accept common GOOGLE_CLIENT_* names */
const googleClientId =
  process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "";
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile && "email" in profile && profile.email) {
        const p = profile as { email: string; name?: string; sub?: string; picture?: string };
        const res = await fetch(`${authServiceUrl}/internal/users/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: p.email,
            fullName: p.name ?? p.email,
            googleSub: p.sub ?? account.providerAccountId,
            image: p.picture ?? null,
          }),
        });
        if (res.ok) {
          const u = (await res.json()) as { id: string };
          token.userId = u.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        (session.user as { id: string }).id = token.userId as string;
      }
      return session;
    },
  },
});
