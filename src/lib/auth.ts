import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GithubProvider, { type GithubProfile } from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NEXTAUTH_SECRET } = process.env;
const githubConfigured = Boolean(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET);
const githubClientId = GITHUB_CLIENT_ID ?? "missing-client-id";
const githubClientSecret = GITHUB_CLIENT_SECRET ?? "missing-client-secret";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
          githubId: profile.id.toString(),
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "database",
  },
  secret: NEXTAUTH_SECRET ?? "development-secret",
  callbacks: {
    async signIn() {
      if (!githubConfigured) {
        console.warn("GitHub OAuth is not configured. Set GITHUB_CLIENT_ID/SECRET to enable it.");
        return false;
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.username =
          user.username ?? user.name ?? user.email ?? session.user.email ?? "";
        session.user.image = user.image ?? user.avatarUrl ?? session.user.image;
      }
      return session;
    },
  },
  events: {
    // Ensure GitHub metadata is persisted on first login.
    async signIn({ user, profile }) {
      if (!profile) return;
      const ghProfile = profile as GithubProfile | undefined;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          githubId: ghProfile?.id?.toString(),
          username:
            user.username ??
            ghProfile?.login ??
            ghProfile?.name ??
            user.email ??
            user.name,
          avatarUrl: ghProfile?.avatar_url ?? user.image ?? undefined,
          name: ghProfile?.name ?? user.name,
          image: ghProfile?.avatar_url ?? user.image ?? undefined,
        },
      });
    },
  },
};

export const getSession = () => getServerSession(authOptions);
export const auth = getSession;
