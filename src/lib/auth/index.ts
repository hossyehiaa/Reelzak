import "next-auth";
import type { DefaultSession } from "next-auth";

// Re-export the auth helpers from one place so callers don't need to know
// the exact module path of authOptions.
export { authOptions } from "@/lib/auth/auth-options";

// Convenience wrappers around getServerSession
import { getServerSession } from "next-auth";
import { authOptions as opts } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import type { Role } from "@/types/domain";

export async function getSession() {
  return getServerSession(opts);
}

/**
 * Returns the authenticated user's basic info from the session, or null.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.email) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as Role,
    brandName: session.user.brandName ?? null,
  };
}

/**
 * Require an authenticated session. Throws if not signed in.
 * Use inside server components / route handlers.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/**
 * Require an admin session. Throws if not signed in or not an admin.
 */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Look up the full User row from DB (useful for fresh data).
 */
export async function getCurrentUserRecord() {
  const user = await getCurrentUser();
  if (!user) return null;
  return db.user.findUnique({ where: { id: user.id } });
}
