'use server';

import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { and, eq, gt, sql, type SQL } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin';
import { isCategory } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function optionalDate(raw: FormDataEntryValue | null): Date | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date value.');
  return d;
}

function scopeConditions(scope: string): SQL[] {
  if (scope === 'all') return [];
  if (!isCategory(scope)) throw new Error('Invalid category.');
  return [eq(products.category, scope)];
}

function revalidateSaleSurfaces() {
  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/admin/sales');
  revalidatePath('/admin/products');
}

export async function applyBulkSale(formData: FormData) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  // Validation failures surface as a banner on the page, never the error boundary.
  let errorMessage: string | null = null;
  try {
    const pct = parseInt(formData.get('percent') as string, 10);
    if (!Number.isInteger(pct) || pct < 1 || pct > 90) throw new Error('Percent must be between 1 and 90.');

    const scope = (formData.get('category') as string) || 'all';
    const startsAt = optionalDate(formData.get('saleStartsAt'));
    const endsAt = optionalDate(formData.get('saleEndsAt'));
    if (startsAt && endsAt && endsAt <= startsAt) throw new Error('Sale end must be after sale start.');

    // SQL-side computation: one UPDATE covers the whole scope. pct >= 1 guarantees
    // salePrice < price for every price > 0 (price 0 is skipped — nothing to discount).
    await db
      .update(products)
      .set({
        salePrice: sql`CAST(ROUND(${products.price} * ${100 - pct} / 100.0) AS integer)`,
        saleStartsAt: startsAt,
        saleEndsAt: endsAt,
      })
      .where(and(gt(products.price, 0), ...scopeConditions(scope)));
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Failed to apply the sale.';
  }

  if (errorMessage) {
    redirect(`/admin/sales?error=${encodeURIComponent(errorMessage)}`);
  }
  revalidateSaleSurfaces();
}

export async function clearSale(formData: FormData) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  let errorMessage: string | null = null;
  try {
    const scope = (formData.get('category') as string) || 'all';
    const conditions = scopeConditions(scope);

    await db
      .update(products)
      .set({ salePrice: null, saleStartsAt: null, saleEndsAt: null })
      .where(conditions.length ? and(...conditions) : undefined);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Failed to clear sales.';
  }

  if (errorMessage) {
    redirect(`/admin/sales?error=${encodeURIComponent(errorMessage)}`);
  }
  revalidateSaleSurfaces();
}
