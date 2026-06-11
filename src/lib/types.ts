import type { products } from '@/lib/db/schema';

/** A product row as selected from the DB (money fields are integer pence). */
export type Product = typeof products.$inferSelect;
