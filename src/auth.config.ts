import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { getUserById } from "./lib/user";

export default {
  providers: [Google],
  pages: {
    signIn: "/pricing",
    error: "/error",
  },
  callbacks: {
    async session({ token, session }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        if (token.email) {
          session.user.email = token.email;
        }

        if (typeof token.hasPaid !== "undefined") {
          session.user.hasPaid = token.hasPaid as boolean;
        }

        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }

      return session;
    },

    async jwt({ token }) {
      if (!token.sub) return token;

      const dbUser = await getUserById(token.sub);

      if (!dbUser) return token;

      token.name = dbUser.name;
      token.email = dbUser.email;
      token.picture = dbUser.image;
      token.hasPaid = dbUser.hasPaid;

      return token;
    },
  },
} satisfies NextAuthConfig;
