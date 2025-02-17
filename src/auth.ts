import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "./utils/get-prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      stripePriceId?: string | null;
      hasPaid?: boolean;
      paidAt?: Date | null;
    };
  }
  interface User {
    id?: string;
    stripe_price_id?: string;
    has_paid?: boolean;
    paid_at?: Date | null;
  }
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
  unstable_update: update,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
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
  },
});
