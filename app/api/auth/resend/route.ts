/**
 * POST /api/auth/resend  { email }
 *
 * Issues a fresh magic link for an existing account and pushes it to GHL with
 * a `magic-link-resend` tag (a GHL workflow on that tag sends the SMS).
 *
 * Privacy (Power of Ten "fail safe"): always returns a neutral { ok: true }
 * regardless of whether the email exists — never reveals account existence
 * (no enumeration). Internally it only acts if a matching user is found.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, recipients, tippers } from '@/lib/db';
import { issueMagicLink } from '@/lib/auth/magic-link';

export const runtime = 'nodejs';

const BodySchema = z.object({ email: z.string().email().max(160) });

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: true }); // neutral
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: true }); // neutral — don't leak validation detail
  }

  const email = parsed.data.email.toLowerCase();

  // Look for a recipient first, then a tipper.
  const rec = await db
    .select({ id: recipients.id, firstName: recipients.firstName, lastName: recipients.lastName, phone: recipients.phone })
    .from(recipients)
    .where(eq(recipients.email, email))
    .limit(1);

  if (rec[0]) {
    await issueMagicLink({
      userId: rec[0].id,
      role: 'recipient',
      firstName: rec[0].firstName ?? undefined,
      lastName: rec[0].lastName ?? undefined,
      email,
      phone: rec[0].phone ?? undefined,
      tag: 'magic-link-resend',
      kind: 'resend',
    });
    return NextResponse.json({ ok: true });
  }

  const tip = await db
    .select({ id: tippers.id, firstName: tippers.firstName, lastName: tippers.lastName, phone: tippers.phone })
    .from(tippers)
    .where(eq(tippers.email, email))
    .limit(1);

  if (tip[0]) {
    await issueMagicLink({
      userId: tip[0].id,
      role: 'tipper',
      firstName: tip[0].firstName ?? undefined,
      lastName: tip[0].lastName ?? undefined,
      email,
      phone: tip[0].phone ?? undefined,
      tag: 'magic-link-resend',
      kind: 'resend',
    });
  }

  return NextResponse.json({ ok: true });
}
