import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Allow dashboard view access without auth
  if (request.nextUrl.pathname === "/dashboard") {
    return NextResponse.next();
  }

  // Protect dashboard actions (API routes and form submissions)
  if (
    request.nextUrl.pathname.startsWith("/dashboard/actions") ||
    request.nextUrl.pathname.includes("/api/")
  ) {
    if (!session?.user?.id || !session.user.hasPaid) {
      return NextResponse.redirect(new URL("/pricing", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};

export const runtime = "experimental-edge";
