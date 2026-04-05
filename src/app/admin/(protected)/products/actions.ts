'use server';

import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const category = formData.get('category') as string;
  const inStock = parseInt(formData.get('inStock') as string, 10);
  const imageUrls = formData.getAll('imageUrls') as string[];
  
  const fabric = formData.get('fabric') as string;
  const care = formData.get('care') as string;
  const fit = formData.get('fit') as string;
  const sizesRaw = formData.get('sizes') as string;
  const colorName = formData.get('colorName') as string;
  const colorHex = formData.get('colorHex') as string;

  if (!name || !slug || isNaN(price) || !category) {
    throw new Error('Required fields missing.');
  }

  const sizes = sizesRaw ? sizesRaw.split(',').map(s => s.trim()) : ['S', 'M', 'L', 'XL'];
  const colors = colorName && colorHex ? [{ name: colorName, hex: colorHex }] : [{ name: 'Standard', hex: '#222222' }];

  const featuresRaw = formData.get('features') as string;
  const features = featuresRaw ? JSON.parse(featuresRaw) : [];

  // Insert into Neon Database
  await db.insert(products).values({
    name,
    slug,
    description,
    price,
    category,
    inStock: isNaN(inStock) ? 0 : inStock,
    images: imageUrls,
    fabric,
    care,
    fit,
    sizes,
    colors,
    features,
  });

  // Force Next.js to refresh the storefront with new data
  revalidatePath('/shop');
  revalidatePath('/admin');
  
  // Return user to admin dashboard
  redirect('/admin');
}
