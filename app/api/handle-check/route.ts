/**
 * GET /api/handle-check?handle=foo
 *
 * Live availability check for the recipient handle picker. Two gates:
 *   1. shape + reserved (checkHandle) — shared with signup validation
 *   2. uniqueness against the recipients table
 *
 * Returns { available: boolean, reason?: string }. Always 200 — "not
 * available" is a normal answer, not an error.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, recipients } from '@/lib/db';
import { checkHandle } from '@/lib/reserved-handles';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('handle') ?? '';
  const handle = raw.trim().toLowerCase();

  if (!handle) {
    return NextResponse.json({ available: false, reason: 'Enter a handle.' });
  }

  const problem = checkHandle(handle);
  if (problem) {
    return NextResponse.json({ available: false, reason: problem });
  }

  const existing = await db
    .select({ id: recipients.id })
    .from(recipients)
    .where(eq(recipients.handle, handle))
    .limit(1);

  if (existing[0]) {
    return NextResponse.json({ available: false, reason: 'That handle is taken.' });
  }

  return NextResponse.json({ available: true });
}
