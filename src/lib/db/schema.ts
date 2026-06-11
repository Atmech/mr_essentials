import {
  timestamp,
  pgTable,
  pgEnum,
  text,
  primaryKey,
  integer,
  serial,
  json,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Enums (single source of truth shared with src/lib/constants.ts) ---
export const productCategory = pgEnum("product_category", [
  "hoodies",
  "tees",
  "shorts",
  "pants",
  "tracksuits",
  "jackets",
  "accessories",
]);
export const productGender = pgEnum("product_gender", ["men", "kids", "unisex"]);
export const userRole = pgEnum("user_role", ["user", "admin"]);

// --- NextAuth Core Tables ---

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  phone: text("phone").unique(),
  phoneVerified: timestamp("phoneVerified", { mode: "date" }),
  role: userRole("role").notNull().default("user"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// --- E-Commerce Tables ---

export const products = pgTable("product", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // GBP in pence
  salePrice: integer("salePrice"), // GBP in pence; on sale when set and < price
  images: json("images").$type<string[]>(),
  sizes: json("sizes").$type<string[]>(),
  colors: json("colors").$type<{name: string, hex: string}[]>(),
  fabric: text("fabric"),
  care: text("care"),
  fit: text("fit"),
  category: productCategory("category").notNull(),
  gender: productGender("gender").notNull().default("unisex"),
  inStock: integer("inStock").notNull().default(0),
  features: json("features").$type<{title: string, description: string, image: string}[]>(),
  archived: boolean("archived").notNull().default(false), // hidden from the storefront, kept for order history
  featured: boolean("featured").notNull().default(false), // surfaces first on the homepage
  saleStartsAt: timestamp("saleStartsAt", { mode: "date" }), // null = no start bound
  saleEndsAt: timestamp("saleEndsAt", { mode: "date" }), // null = no end bound
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const orders = pgTable("order", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  stripeSessionId: text("stripeSessionId").unique(),
  totalAmount: integer("totalAmount").notNull(), // GBP in pence
  status: text("status").notNull().default("pending"),
  shippingAddress: json("shippingAddress"),
  trackingNumber: text("trackingNumber"),
  trackingUrl: text("trackingUrl"),
  invoiceUrl: text("invoiceUrl"), // Stripe hosted_invoice_url
  invoicePdf: text("invoicePdf"), // Stripe invoice_pdf download link
  couponCode: text("couponCode"), // snapshot of the redeemed code (no FK — survives coupon deletion)
  discountAmount: integer("discountAmount").notNull().default(0), // GBP in pence
  oversold: boolean("oversold").notNull().default(false), // settle couldn't decrement stock for some item
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const orderItems = pgTable("order_item", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: text("orderId")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("productId")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(), // unit price in pence at time of purchase
  size: text("size"),
  color: text("color"),
});

export const wishlists = pgTable("wishlist", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const couponType = pgEnum("coupon_type", ["percent", "fixed"]);

export const coupons = pgTable("coupon", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // stored uppercase
  type: couponType("type").notNull(),
  value: integer("value").notNull(), // percent 1-100, or pence for fixed
  active: boolean("active").notNull().default(true),
  startsAt: timestamp("startsAt", { mode: "date" }),
  endsAt: timestamp("endsAt", { mode: "date" }),
  maxUses: integer("maxUses"), // null = unlimited
  usedCount: integer("usedCount").notNull().default(0),
  minSubtotal: integer("minSubtotal"), // pence, null = none
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

export const addresses = pgTable("address", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull().default("Home"),
  fullName: text("fullName").notNull(),
  phone: text("phone"),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state"),
  postalCode: text("postalCode").notNull(),
  country: text("country").notNull().default("GB"),
  isDefault: integer("isDefault").notNull().default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

// --- Relations ---

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  wishlists: many(wishlists),
  addresses: many(addresses),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  wishlists: many(wishlists),
  orderItems: many(orderItems),
}));
