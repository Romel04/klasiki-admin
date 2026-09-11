// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/products", "/categories", "/orders", "/activity-log", "/settings"];
const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

export function proxy(request: NextRequest) {
  if (SKIP_AUTH) return NextResponse.next();

  const token = request.cookies.get("klasiki_admin_token");
  const isProtected = PROTECTED_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/products/:path*", "/categories/:path*", "/orders/:path*", "/activity-log/:path*", "/settings/:path*"],
};