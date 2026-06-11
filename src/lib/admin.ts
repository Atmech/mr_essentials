import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** True when the email is in the ADMIN_EMAILS allowlist (comma-separated). */
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

/**
 * Server-side admin gate. Returns the session if the caller is an admin,
 * otherwise null. Use in route handlers / server actions for defense-in-depth
 * (the middleware + layout also gate, but mutations must check independently).
 */
export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}
