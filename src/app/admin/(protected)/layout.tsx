import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminLogout } from "./AdminLogout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  // If no valid session cookie, send to admin login
  if (adminSession?.value !== process.env.NEXTAUTH_SECRET) {
    redirect("/admin/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        width: "240px",
        flexShrink: 0,
        backgroundColor: "var(--color-black)",
        color: "var(--color-white)",
        padding: "var(--space-8) var(--space-6)",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{ marginBottom: "var(--space-10)" }}>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            letterSpacing: "var(--tracking-widest)",
            color: "var(--color-alert-red)",
            marginBottom: "var(--space-1)",
          }}>
            MR ESSENTIALS
          </p>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "var(--text-2xl)",
            color: "var(--color-white)",
            lineHeight: 1,
          }}>
            SYS_ADMIN
          </h2>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: 1 }}>
          {[
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/products", label: "Products" },
            { href: "/admin/orders", label: "Orders" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-sm)",
                letterSpacing: "var(--tracking-wide)",
                color: "var(--color-light-gray)",
                padding: "var(--space-3) var(--space-4)",
                borderLeft: "2px solid transparent",
                transition: "all var(--duration-fast)",
                textTransform: "uppercase",
              }}
            >
              {label}
            </Link>
          ))}

          <hr style={{ border: "none", borderTop: "1px solid var(--color-charcoal)", margin: "var(--space-4) 0" }} />

          <Link href="/" style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-mid-gray)",
            letterSpacing: "var(--tracking-wide)",
            textTransform: "uppercase",
            padding: "var(--space-2) var(--space-4)",
          }}>
            ← View Store
          </Link>

          {/* Logout */}
          <div style={{ marginTop: "auto" }}>
            <AdminLogout />
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        backgroundColor: "var(--color-offwhite)",
        padding: "var(--space-10)",
        overflowY: "auto",
      }}>
        {children}
      </main>
    </div>
  );
}
