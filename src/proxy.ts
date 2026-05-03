import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ADMIN_ROLES = ["ADMIN", "SELLER", "FLORIST", "DELIVERY"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const role = req.auth.user?.role;
    if (!role || !ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect /mi-cuenta and /checkout (require any login)
  if (pathname.startsWith("/mi-cuenta") || pathname.startsWith("/checkout")) {
    if (!req.auth) {
      return NextResponse.redirect(
        new URL("/login?from=" + encodeURIComponent(pathname), req.url)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/mi-cuenta/:path*", "/checkout/:path*"],
};
