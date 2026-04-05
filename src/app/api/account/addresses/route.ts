import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { addresses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const [newAddr] = await db.insert(addresses).values({
    userId: session.user.id,
    label: body.label || 'Home',
    fullName: body.fullName,
    phone: body.phone || null,
    line1: body.line1,
    line2: body.line2 || null,
    city: body.city,
    state: body.state || null,
    postalCode: body.postalCode,
    country: body.country || 'GB',
  }).returning();

  return NextResponse.json(newAddr);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await db.delete(addresses).where(
    and(eq(addresses.id, id), eq(addresses.userId, session.user.id))
  );

  return NextResponse.json({ ok: true });
}
