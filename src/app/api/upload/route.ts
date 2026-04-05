import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'filename is required' }, { status: 400 });
  }

  // Ensure user is an admin before allowing upload
  const adminCookie = request.headers.get("cookie")?.includes("admin_session");
  if (!adminCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!request.body) {
    return NextResponse.json({ error: 'Body is required' }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'public', // makes the URL accessible on your storefront
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Vercel Blob Upload Error:", error);
    return NextResponse.json({ error: 'Failed to upload: ' + String(error) }, { status: 500 });
  }
}
