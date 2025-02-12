import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Check if trying to access dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session?.user) {
      // Not logged in, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!session.user.hasPaid) {
      // Logged in but hasn't paid, redirect to pricing
      return NextResponse.redirect(new URL("/pricing", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

export const runtime = "experimental-edge";
