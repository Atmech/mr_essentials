import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export async function POST(request: Request): Promise<NextResponse> {
  // Authz: real session check, not a cookie-substring match.
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!request.body) {
    return NextResponse.json({ error: 'Body is required' }, { status: 400 });
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WebP or AVIF images are allowed' }, { status: 415 });
  }

  // Read the body so we can enforce a size cap and avoid trusting client filenames.
  const buffer = Buffer.from(await request.arrayBuffer());
  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: 'Empty file' }, { status: 400 });
  }
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 8 MB limit' }, { status: 413 });
  }

  // Generate the storage key server-side — never use a caller-supplied path.
  const key = `products/${crypto.randomUUID()}.${EXT[contentType]}`;

  try {
    const blob = await put(key, buffer, { access: 'public', contentType });
    return NextResponse.json(blob);
  } catch {
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 });
  }
}
