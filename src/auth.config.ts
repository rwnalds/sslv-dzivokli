import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { getUserById } from "./lib/user";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [Google],
  pages: {
    signIn: "/pricing",
  },
  callbacks: {
    authorized: async ({ auth }) => {
      if (!auth?.user) return false;
      if (!auth.user.hasPaid) return false;
      return true;
    },
    async session({ token, session }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        if (token.email) {
          session.user.email = token.email;
        }

        if (token.hasPaid) {
          session.user.hasPaid = token.hasPaid;
        }

        session.user.name = token.name;
        session.user.image = token.picture;
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
