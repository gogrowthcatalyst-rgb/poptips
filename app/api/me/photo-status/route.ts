/**
 * GET /api/me/photo-status
 *
 * Session-gated. Returns the current recipient's photo-compliance state so the
 * dashboard banner can render itself without the (mock) dashboard needing
 * session plumbing. Tippers get a neutral non-recipient response.
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { getRecipientById } from '@/lib/db/recipients';
import { computeTippableStatus, photoHoursLeft } from '@/lib/recipient-status';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ role: null });
  }
  if (session.role !== 'recipient') {
    return NextResponse.json({ role: session.role });
  }

  const recipient = await getRecipientById(session.userId);
  if (!recipient) {
    return NextResponse.json({ role: 'recipient', status: 'incomplete' });
  }

  const status = computeTippableStatus({
    paymentAppCount: recipient.paymentApps.length,
    photoUrl: recipient.photoUrl,
    photoRequiredBy: recipient.photoRequiredBy,
  });

  return NextResponse.json({
    role: 'recipient',
    status,
    hasPhoto: Boolean(recipient.photoUrl),
    hoursLeft: photoHoursLeft(recipient.photoRequiredBy),
    handle: recipient.handle,
  });
}
