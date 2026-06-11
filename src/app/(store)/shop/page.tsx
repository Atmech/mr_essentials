import { Suspense } from 'react';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { and, eq, gt, isNotNull, isNull, lt, lte, or, type SQL } from 'drizzle-orm';
import { isGender } from '@/lib/constants';
import ShopClient from './ShopClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop All — MR Essentials',
  description: 'Browse the complete MR Essentials collection of premium men\'s and kids\' streetwear.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string; sale?: string; category?: string }>;
}) {
  const sp = await searchParams;

  // gender + sale are filtered server-side (driven by nav/hero links);
  // category + sort are refined client-side in ShopClient.
  const conditions: SQL[] = [eq(products.archived, false)];
  if (sp.gender && isGender(sp.gender)) conditions.push(eq(products.gender, sp.gender));
  if (sp.sale === 'true') {
    // On sale = sale price set below base price AND inside the sale window.
    const now = new Date();
    conditions.push(isNotNull(products.salePrice));
    conditions.push(lt(products.salePrice, products.price));
    conditions.push(or(isNull(products.saleStartsAt), lte(products.saleStartsAt, now))!);
    conditions.push(or(isNull(products.saleEndsAt), gt(products.saleEndsAt, now))!);
  }

  const liveProducts = await db.select().from(products).where(and(...conditions));

  return (
    <Suspense fallback={null}>
      <ShopClient liveProducts={liveProducts} />
    </Suspense>
  );
}
