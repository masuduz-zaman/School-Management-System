import { NextResponse, type NextRequest } from "next/server";

// Fast redirect for signed-out visitors. The backend still verifies the token
// on every API call, and the app checks the role again on the client.
export function middleware(req: NextRequest) {
  if (!req.cookies.get("accessToken")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*", "/profile/:path*"],
};
