import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Quick, optimistic check for private areas: with no session cookie at all,
 * redirect to sign-in straight away instead of streaming a page first.
 * This is NOT the security check: role checks happen on the server in
 * src/lib/session.ts and in every data getter.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace/:path*", "/admin/:path*", "/invite/:path*"],
};
