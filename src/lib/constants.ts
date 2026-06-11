// Single source of truth for product taxonomy.
// Shared by the admin form, shop filters, navbar, footer, and server-side validation.
// Mirrors the pgEnums in src/lib/db/schema.ts — keep them in sync.

export const CATEGORIES = [
  { value: "hoodies", label: "Hoodies" },
  { value: "tees", label: "Tees" },
  { value: "shorts", label: "Shorts" },
  { value: "pants", label: "Pants" },
  { value: "tracksuits", label: "Tracksuits" },
  { value: "jackets", label: "Jackets" },
  { value: "accessories", label: "Accessories" },
] as const;

export const GENDERS = [
  { value: "men", label: "Men" },
  { value: "kids", label: "Kids" },
  { value: "unisex", label: "Unisex" },
] as const;

export const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Allowed admin status transitions. pending→cancelled is for abandoned checkouts
// (no restock — stock is only decremented at settlement); cancelling a paid or
// shipped order restores stock. delivered/cancelled are terminal.
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export type Category = (typeof CATEGORIES)[number]["value"];
export type Gender = (typeof GENDERS)[number]["value"];

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as readonly Category[];
export const GENDER_VALUES = GENDERS.map((g) => g.value) as readonly Gender[];

export function isCategory(v: string): v is Category {
  return (CATEGORY_VALUES as readonly string[]).includes(v);
}
export function isGender(v: string): v is Gender {
  return (GENDER_VALUES as readonly string[]).includes(v);
}
