import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, ne, and, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import type { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const [product] = await db.select().from(products).where(eq(products.slug, params.slug));
  if (!product) return { title: 'Product Not Found — MR Essentials' };
  return {
    title: `${product.name} — MR Essentials`,
    description: product.description || `Shop ${product.name} from MR Essentials.`,
  };
}

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  
  const [product] = await db.select().from(products).where(eq(products.slug, params.slug));

  if (!product) {
    notFound();
  }

  const relatedProducts = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.category, product.category),
        ne(products.id, product.id)
      )
    )
    .limit(4);

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
