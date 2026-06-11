'use server';

import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { isCategory, isGender, type Gender } from '@/lib/constants';
import { getAdminSession } from '@/lib/admin';
import { poundsToPence } from '@/lib/format';
import { and, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Optional pounds field: empty → null, invalid → throws via caller check (NaN). */
function optionalPounds(raw: FormDataEntryValue | null): number | null {
  if (!String(raw ?? '').trim()) return null;
  return poundsToPence(raw);
}

/** Optional datetime-local field: empty → null. Parsed in server-local time (single-region GB store). */
function optionalDate(raw: FormDataEntryValue | null): Date | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new Error('Invalid date value.');
  return d;
}

/** Shared parse + validation for create/update. Throws friendly errors. */
function parseProductForm(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim().toLowerCase();
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const genderRaw = (formData.get('gender') as string) ?? 'unisex';
  const inStockRaw = parseInt(formData.get('inStock') as string, 10);
  const imageUrls = (formData.getAll('imageUrls') as string[]).filter(Boolean);

  const fabric = formData.get('fabric') as string;
  const care = formData.get('care') as string;
  const fit = formData.get('fit') as string;
  const sizesRaw = formData.get('sizes') as string;

  const price = poundsToPence(formData.get('price'));
  const salePrice = optionalPounds(formData.get('salePrice'));
  const saleStartsAt = optionalDate(formData.get('saleStartsAt'));
  const saleEndsAt = optionalDate(formData.get('saleEndsAt'));

  if (!name) throw new Error('Name is required.');
  if (!slug || !SLUG_RE.test(slug)) {
    throw new Error('Slug must be lowercase letters, numbers and hyphens only.');
  }
  if (Number.isNaN(price)) throw new Error('Price must be a non-negative number.');
  if (!isCategory(category)) throw new Error(`Invalid category: ${category}`);
  const gender: Gender = isGender(genderRaw) ? genderRaw : 'unisex';
  if (salePrice !== null && Number.isNaN(salePrice)) throw new Error('Sale price must be a non-negative number.');
  if (salePrice !== null && salePrice >= price) {
    throw new Error('Sale price must be below the regular price.');
  }
  if (saleStartsAt && saleEndsAt && saleEndsAt <= saleStartsAt) {
    throw new Error('Sale end must be after sale start.');
  }
  const inStock = Number.isFinite(inStockRaw) && inStockRaw >= 0 ? inStockRaw : 0;

  const sizes = sizesRaw ? sizesRaw.split(',').map((s) => s.trim()).filter(Boolean) : ['S', 'M', 'L', 'XL'];

  let features: { title: string; description: string; image: string }[] = [];
  const featuresRaw = formData.get('features') as string;
  if (featuresRaw) {
    try {
      const parsed = JSON.parse(featuresRaw);
      if (Array.isArray(parsed)) features = parsed;
    } catch {
      throw new Error('Features must be valid JSON.');
    }
  }

  return {
    name, slug, description, price, salePrice, saleStartsAt, saleEndsAt,
    category, gender, inStock, imageUrls, sizes, fabric, care, fit, features,
  };
}

/** Colors arrive as a JSON string of {name, hex} rows (edit form) or single colorName/colorHex inputs (create form). */
function parseColors(formData: FormData): { name: string; hex: string }[] {
  const rowsRaw = formData.get('colors') as string | null;
  if (rowsRaw) {
    try {
      const parsed = JSON.parse(rowsRaw);
      if (Array.isArray(parsed)) {
        const rows = parsed
          .filter((c): c is { name: string; hex: string } => !!c && typeof c.name === 'string' && typeof c.hex === 'string')
          .map((c) => ({ name: c.name.trim(), hex: c.hex }))
          .filter((c) => c.name);
        if (rows.length > 0) return rows;
      }
    } catch {
      throw new Error('Colours must be valid JSON.');
    }
  }
  const colorName = formData.get('colorName') as string;
  const colorHex = formData.get('colorHex') as string;
  return colorName && colorHex ? [{ name: colorName, hex: colorHex }] : [{ name: 'Standard', hex: '#222222' }];
}

export async function createProduct(formData: FormData) {
  // Defense-in-depth: the action authorizes itself, not just the page/middleware.
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const parsed = parseProductForm(formData);
  const colors = parseColors(formData);

  const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.slug, parsed.slug));
  if (existing) throw new Error(`Slug "${parsed.slug}" is already in use.`);

  await db.insert(products).values({
    name: parsed.name,
    slug: parsed.slug,
    description: parsed.description,
    price: parsed.price,
    salePrice: parsed.salePrice ?? undefined,
    saleStartsAt: parsed.saleStartsAt,
    saleEndsAt: parsed.saleEndsAt,
    category: parsed.category,
    gender: parsed.gender,
    inStock: parsed.inStock,
    images: parsed.imageUrls,
    fabric: parsed.fabric,
    care: parsed.care,
    fit: parsed.fit,
    sizes: parsed.sizes,
    colors,
    features: parsed.features,
  });

  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath('/admin');
  redirect('/admin');
}

export async function updateProduct(formData: FormData) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const id = parseInt(formData.get('productId') as string, 10);
  if (!Number.isInteger(id)) throw new Error('Invalid product id.');

  const parsed = parseProductForm(formData);
  const colors = parseColors(formData);
  if (parsed.imageUrls.length === 0) throw new Error('At least one product image is required.');

  const [current] = await db.select({ id: products.id }).from(products).where(eq(products.id, id));
  if (!current) throw new Error('Product not found.');

  const [slugClash] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.slug, parsed.slug), ne(products.id, id)));
  if (slugClash) throw new Error(`Slug "${parsed.slug}" is already in use by another product.`);

  const archived = formData.get('archived') === 'on';
  const featured = formData.get('featured') === 'on';

  await db
    .update(products)
    .set({
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      price: parsed.price,
      salePrice: parsed.salePrice,
      saleStartsAt: parsed.saleStartsAt,
      saleEndsAt: parsed.saleEndsAt,
      category: parsed.category,
      gender: parsed.gender,
      inStock: parsed.inStock,
      images: parsed.imageUrls,
      fabric: parsed.fabric,
      care: parsed.care,
      fit: parsed.fit,
      sizes: parsed.sizes,
      colors,
      features: parsed.features,
      archived,
      featured,
    })
    .where(eq(products.id, id));

  revalidatePath('/');
  revalidatePath('/shop');
  revalidatePath(`/shop/${parsed.slug}`);
  revalidatePath('/admin/products');
  redirect('/admin/products');
}
