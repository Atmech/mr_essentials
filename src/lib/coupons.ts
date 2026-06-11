import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { formatGBP } from '@/lib/format';

export type CouponCheck =
  | { ok: true; coupon: typeof coupons.$inferSelect; discountPence: number }
  | { ok: false; error: string };

/**
 * Validate a coupon code against the current subtotal. Pure read — redemption
 * (usedCount increment) happens at order settlement, exactly once per paid order.
 */
export async function validateCoupon(code: string, subtotalPence: number, now: Date = new Date()): Promise<CouponCheck> {
  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
  if (!coupon || !coupon.active) return { ok: false, error: 'Invalid coupon code.' };
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, error: 'This coupon is not active yet.' };
  if (coupon.endsAt && coupon.endsAt <= now) return { ok: false, error: 'This coupon has expired.' };
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, error: 'This coupon has been fully redeemed.' };
  }
  if (coupon.minSubtotal != null && subtotalPence < coupon.minSubtotal) {
    return { ok: false, error: `Spend at least ${formatGBP(coupon.minSubtotal)} to use this coupon.` };
  }

  const discountPence =
    coupon.type === 'percent'
      ? Math.round((subtotalPence * coupon.value) / 100)
      : Math.min(coupon.value, subtotalPence); // fixed amount clamped to the subtotal

  if (discountPence <= 0) return { ok: false, error: 'Invalid coupon code.' };
  return { ok: true, coupon, discountPence };
}
