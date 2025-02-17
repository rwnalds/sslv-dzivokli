import {} from "@prisma/client";
import { User } from "next-auth";
import "next-auth/jwt";

export type ExtendedUser = User & {
  hasPaid: boolean;
};

declare module "next-auth/jwt" {
  interface JWT {
    hasPaid: boolean;
  }
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
