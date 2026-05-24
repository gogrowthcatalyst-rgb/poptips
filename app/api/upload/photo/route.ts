/**
 * POST /api/upload/photo  (multipart: file)
 *
 * Session-gated photo upload for the logged-in recipient. Validates type +
 * size at the boundary, stores in Vercel Blob keyed by the user's id, returns
 * the public URL. A user can only write their own photo (id from session).
 */

import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/lib/auth/server';
import { eq } from 'drizzle-orm';
import { db, recipients } from '@/lib/db';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'recipient') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Uploads are not configured.' }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid upload.' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: 'Use a JPG, PNG, or WebP image.' }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be under 5 MB.' }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = EXT[file.type] ?? 'jpg';

  const blob = await put(`recipient-photos/${session.userId}.${ext}`, buffer, {
    access: 'public',
    contentType: file.type,
    addRandomSuffix: false,
  });

  // A photo makes them compliant immediately: persist it and clear the window.
  await db
    .update(recipients)
    .set({ photoUrl: blob.url, photoRequiredBy: null, updatedAt: new Date() })
    .where(eq(recipients.id, session.userId));

  return NextResponse.json({ ok: true, url: blob.url });
}
