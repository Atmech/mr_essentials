import { db } from "@/lib/db";
import { orders, products, users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import Link from "next/link";

export default async function AdminDashboard() {
  const [userCount] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(users);
  const [productCount] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(products);
  const [orderCount] = await db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(orders);

  const stats = [
    { label: "Total Orders", value: orderCount?.count ?? 0, href: "/admin/orders" },
    { label: "Inventory Items", value: productCount?.count ?? 0, href: "/admin/products" },
    { label: "Registered Accounts", value: userCount?.count ?? 0, href: null },
  ];

  return (
    <div>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          letterSpacing: "var(--tracking-widest)",
          color: "var(--color-mid-gray)",
          textTransform: "uppercase",
          marginBottom: "var(--space-2)",
        }}>
          Overview
        </p>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "var(--text-4xl)",
          lineHeight: 1,
        }}>
          SYSTEM_OVERVIEW
        </h1>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "var(--space-6)",
        marginBottom: "var(--space-12)",
      }}>
        {stats.map(({ label, value, href }) => (
          <div key={label} style={{
            backgroundColor: "var(--color-white)",
            border: "var(--border-thin)",
            padding: "var(--space-6)",
          }}>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              letterSpacing: "var(--tracking-widest)",
              color: "var(--color-mid-gray)",
              textTransform: "uppercase",
              marginBottom: "var(--space-3)",
            }}>
              {label}
            </p>
            <p style={{
              fontFamily: "var(--font-heading)",
              fontSize: "var(--text-5xl)",
              lineHeight: 1,
              marginBottom: href ? "var(--space-4)" : 0,
            }}>
              {value}
            </p>
            {href && (
              <Link href={href} style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                letterSpacing: "var(--tracking-wide)",
                textTransform: "uppercase",
                textDecoration: "underline",
                color: "var(--color-mid-gray)",
              }}>
                Manage →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{
        backgroundColor: "var(--color-white)",
        border: "var(--border-thin)",
        padding: "var(--space-8)",
      }}>
        <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-6)" }}>
          QUICK ACTIONS
        </h2>
        <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <Link href="/admin/products/new" style={{
            padding: "var(--space-3) var(--space-6)",
            backgroundColor: "var(--color-black)",
            color: "var(--color-white)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            letterSpacing: "var(--tracking-wide)",
            textTransform: "uppercase",
          }}>
            + Add Product
          </Link>
          <Link href="/admin/orders" style={{
            padding: "var(--space-3) var(--space-6)",
            border: "var(--border-medium)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            letterSpacing: "var(--tracking-wide)",
            textTransform: "uppercase",
          }}>
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
