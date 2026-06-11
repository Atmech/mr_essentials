import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import EditProductClient from './EditProductClient';

export const metadata = { title: 'Edit Product — Admin' };

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const numId = Number(id);
  if (!Number.isInteger(numId)) notFound();

  const [product] = await db.select().from(products).where(eq(products.id, numId));
  if (!product) notFound();

  return <EditProductClient product={product} />;
}
