import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/products", "/categories", "/orders", "/districts", "/users", "/activity-log", "/settings"];
const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

export function proxy(request: NextRequest) {
  if (SKIP_AUTH) return NextResponse.next();

  // We can only check for the refresh token cookie here (edge runtime can't
  // see the in-memory access token) — its presence is enough to gate the route.
  const refreshToken = request.cookies.get("klasiki_refresh_token");
  const isProtected = PROTECTED_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtected && !refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/products/:path*", "/categories/:path*", "/orders/:path*", "/districts/:path*", "/users/:path*", "/activity-log/:path*", "/settings/:path*"],
};