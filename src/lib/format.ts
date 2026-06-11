// Money is stored as integer pence everywhere. Format only at the display edge.

/** Format integer pence as a GBP string, e.g. 12000 -> "£120.00". */
export function formatGBP(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

/** Parse a pounds form value (e.g. "49.99") into integer pence. Returns NaN when invalid. */
export function poundsToPence(value: FormDataEntryValue | null): number {
  const raw = String(value ?? "").trim();
  if (!raw) return NaN;
  const pounds = Number(raw);
  if (!Number.isFinite(pounds) || pounds < 0) return NaN;
  return Math.round(pounds * 100);
}

/**
 * The sale-relevant slice of a product row. Date fields tolerate strings for
 * values that crossed a JSON boundary (e.g. the search API).
 */
export type SaleFields = {
  price: number;
  salePrice?: number | null;
  saleStartsAt?: Date | string | null;
  saleEndsAt?: Date | string | null;
};

/** Whether `now` falls inside an optional [startsAt, endsAt) window. Null bounds are open. */
export function saleWindowActive(
  startsAt?: Date | string | null,
  endsAt?: Date | string | null,
  now: Date = new Date()
): boolean {
  if (startsAt && new Date(startsAt) > now) return false;
  if (endsAt && new Date(endsAt) <= now) return false;
  return true;
}

/** Whether a product is on sale: sale price below base price AND inside the sale window. */
export function isOnSale(p: SaleFields, now: Date = new Date()): boolean {
  return p.salePrice != null && p.salePrice < p.price && saleWindowActive(p.saleStartsAt, p.saleEndsAt, now);
}

/** Effective unit price in pence: the sale price while the sale is active, else the base price. */
export function effectivePence(p: SaleFields, now: Date = new Date()): number {
  return isOnSale(p, now) ? (p.salePrice as number) : p.price;
}
