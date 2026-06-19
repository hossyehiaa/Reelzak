import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Route guards
// ---------------------------------------------------------------------------
// Public routes — accessible without auth.
const PUBLIC_PATHS = ["/", "/login", "/signup"];

// Routes that require ADMIN role.
const ADMIN_PATHS = ["/admin"];

function isPublic(path: string): boolean {
  if (PUBLIC_PATHS.includes(path)) return true;
  // Allow NextAuth internals + static assets
  if (path.startsWith("/api/auth")) return true;
  if (path.startsWith("/_next")) return true;
  if (path.includes(".")) return true; // static files
  return false;
}

function isAdminPath(path: string): boolean {
  return ADMIN_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;
    const token = req.nextauth.token;

    // Already-authed users visiting /login or /signup should bounce to their
    // appropriate dashboard instead of seeing the auth page again.
    if ((path === "/login" || path === "/signup") && token) {
      const dest = token.role === "ADMIN" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Called before the middleware function. If false, user is redirected
      // to the sign-in page (pages.signIn = "/login").
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (isPublic(path)) return true;
        if (!token) return false;
        if (isAdminPath(path) && token.role !== "ADMIN") return false;
        return true;
      },
    },
  },
);

export const config = {
  // Run middleware on everything except static files and NextAuth internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
