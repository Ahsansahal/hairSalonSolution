import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get("salon_authenticated")?.value;
  const tokenCookie = request.cookies.get("salon_token")?.value;

  const isAuthenticated = Boolean(authCookie === "true" || tokenCookie);

  // Strict route protection: nobody can enter /dashboard without authentication
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and navigating to /login without explicit switch, redirect to dashboard
  if (pathname === "/login" && isAuthenticated && !request.nextUrl.searchParams.has("switch")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login"],
};
