import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import ShopClient from './ShopClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop All — MR Essentials',
  description: 'Browse the complete MR Essentials collection. Engineered garments built for structure.',
};

export default async function ShopPage() {
  const liveProducts = await db.select().from(products);
  
  return <ShopClient liveProducts={liveProducts} />;
}
