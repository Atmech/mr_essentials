import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { ilike, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const pattern = `%${q}%`;
  const results = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      price: products.price,
      category: products.category,
      images: products.images,
    })
    .from(products)
    .where(
      or(
        ilike(products.name, pattern),
        ilike(products.category, pattern),
        ilike(products.description, pattern)
      )
    )
    .limit(10);

  return NextResponse.json(results);
}
