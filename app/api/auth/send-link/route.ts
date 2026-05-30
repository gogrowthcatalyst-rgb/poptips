/**
 * POST /api/auth/send-link  { phone }
 *
 * Phone-based variant of /api/auth/resend. Returns a neutral { ok: true }
 * regardless of whether the phone matches an account — never reveals
 * existence (no enumeration). Internally, only acts if a matching user is
 * found, in which case a fresh magic link is issued and GHL sends the SMS
 * via the `magic-link-resend` workflow tag.
 *
 * Phone is normalized through the same toE164() the signup path uses, so
 * the DB lookup is reliable regardless of how the user types the number.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, recipients, tippers } from '@/lib/db';
import { issueMagicLink } from '@/lib/auth/magic-link';
import { toE164 } from '@/lib/phone';

export const runtime = 'nodejs';

const BodySchema = z.object({ phone: z.string().min(7).max(40) });

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: true }); // neutral — bad JSON
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: true }); // neutral — don't leak detail
  }

  // Same normalization as signup, so the lookup will match what's stored.
  const phoneE164 = toE164(parsed.data.phone);
  if (!phoneE164) {
    return NextResponse.json({ ok: true }); // neutral — unparseable phone
  }

  // Look for a recipient first (matches resend's role precedence).
  const rec = await db
    .select({
      id: recipients.id,
      firstName: recipients.firstName,
      lastName: recipients.lastName,
      email: recipients.email,
      phone: recipients.phone,
    })
    .from(recipients)
    .where(eq(recipients.phone, phoneE164))
    .limit(1);

  if (rec[0]) {
    await issueMagicLink({
      userId: rec[0].id,
      role: 'recipient',
      firstName: rec[0].firstName ?? undefined,
      lastName: rec[0].lastName ?? undefined,
      email: rec[0].email ?? '',
      phone: rec[0].phone ?? undefined,
      tag: 'magic-link-resend',
      kind: 'resend',
    });
    return NextResponse.json({ ok: true });
  }

  const tip = await db
    .select({
      id: tippers.id,
      firstName: tippers.firstName,
      lastName: tippers.lastName,
      email: tippers.email,
      phone: tippers.phone,
    })
    .from(tippers)
    .where(eq(tippers.phone, phoneE164))
    .limit(1);

  if (tip[0]) {
    await issueMagicLink({
      userId: tip[0].id,
      role: 'tipper',
      firstName: tip[0].firstName ?? undefined,
      lastName: tip[0].lastName ?? undefined,
      email: tip[0].email ?? '',
      phone: tip[0].phone ?? undefined,
      tag: 'magic-link-resend',
      kind: 'resend',
    });
  }

  return NextResponse.json({ ok: true });
}
