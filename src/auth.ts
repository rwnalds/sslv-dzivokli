import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { DefaultSession } from "next-auth";
import authConfig from "./auth.config";
import { prisma } from "./lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      hasPaid: boolean;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  ...authConfig,
});
