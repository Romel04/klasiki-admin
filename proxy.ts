import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/products", "/categories", "/orders", "/preorders", "/districts", "/users", "/activity-log", "/settings"];
const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

export function proxy(request: NextRequest) {
  if (SKIP_AUTH) return NextResponse.next();

  // Check for either the refresh token or access token cookie.
  const refreshToken = request.cookies.get("klasiki_refresh_token");
  const accessToken = request.cookies.get("klasiki_access_token");
  const isProtected = PROTECTED_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtected && !refreshToken && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/products/:path*", "/categories/:path*", "/orders/:path*", "/preorders/:path*", "/districts/:path*", "/users/:path*", "/activity-log/:path*", "/settings/:path*"],
};