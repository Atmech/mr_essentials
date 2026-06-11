'use server';

import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin';
import { poundsToPence } from '@/lib/format';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const CODE_RE = /^[A-Z0-9_-]{3,32}$/;

function optionalDate(raw: FormDataEntryValue | null): Date | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date value.');
  return d;
}

export async function createCoupon(formData: FormData) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  // Validation failures surface as a banner on the page, never the error boundary.
  let errorMessage: string | null = null;
  try {
    const code = ((formData.get('code') as string) || '').trim().toUpperCase();
    const type = formData.get('type') as string;
    const startsAt = optionalDate(formData.get('startsAt'));
    const endsAt = optionalDate(formData.get('endsAt'));

    if (!CODE_RE.test(code)) {
      throw new Error('Code must be 3-32 characters: letters, numbers, hyphens or underscores (no spaces).');
    }
    if (type !== 'percent' && type !== 'fixed') throw new Error('Invalid coupon type.');

    let value: number;
    if (type === 'percent') {
      value = parseInt(formData.get('value') as string, 10);
      if (!Number.isInteger(value) || value < 1 || value > 100) {
        throw new Error('Percent must be a whole number between 1 and 100.');
      }
    } else {
      value = poundsToPence(formData.get('value'));
      if (Number.isNaN(value) || value <= 0) throw new Error('Fixed amount must be a positive £ value.');
    }

    if (startsAt && endsAt && endsAt <= startsAt) throw new Error('Coupon end must be after start.');

    const maxUsesRaw = String(formData.get('maxUses') ?? '').trim();
    const maxUses = maxUsesRaw ? parseInt(maxUsesRaw, 10) : null;
    if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
      throw new Error('Max uses must be a positive whole number (or blank for unlimited).');
    }

    const minSubtotalRaw = String(formData.get('minSubtotal') ?? '').trim();
    const minSubtotal = minSubtotalRaw ? poundsToPence(minSubtotalRaw) : null;
    if (minSubtotal !== null && (Number.isNaN(minSubtotal) || minSubtotal < 0)) {
      throw new Error('Minimum subtotal must be a non-negative £ value (or blank for none).');
    }

    const [existing] = await db.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, code));
    if (existing) throw new Error(`Coupon code "${code}" already exists.`);

    await db.insert(coupons).values({ code, type, value, startsAt, endsAt, maxUses, minSubtotal });
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Failed to create the coupon.';
  }

  if (errorMessage) {
    redirect(`/admin/coupons?error=${encodeURIComponent(errorMessage)}`);
  }
  revalidatePath('/admin/coupons');
  redirect('/admin/coupons');
}

export async function toggleCouponActive(formData: FormData) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const id = parseInt(formData.get('couponId') as string, 10);
  if (!Number.isInteger(id)) throw new Error('Invalid coupon id.');

  await db
    .update(coupons)
    .set({ active: sql`NOT ${coupons.active}` })
    .where(eq(coupons.id, id));

  revalidatePath('/admin/coupons');
}

export async function deleteCoupon(formData: FormData) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const id = parseInt(formData.get('couponId') as string, 10);
  if (!Number.isInteger(id)) throw new Error('Invalid coupon id.');

  // Safe to hard-delete: orders snapshot the code as plain text, not an FK.
  await db.delete(coupons).where(eq(coupons.id, id));

  revalidatePath('/admin/coupons');
}
