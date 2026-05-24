/**
 * POST /api/signup
 *
 * Native signup for both roles. Our DB is the source of truth; GHL is a
 * best-effort downstream push that also carries the magic-link URL.
 *
 * Flow (Power of Ten aligned — validate at the boundary, check every return,
 * no fatal coupling to external services):
 *   1. Validate the payload by role (now incl. home ZIP + industry; recipients
 *      also supply a workplace name).
 *   2. Create the user in our DB (recipient with claimed handle + QR, apps
 *      empty until profile completion; or tipper with self-reported apps).
 *   3. Issue a magic-link token, write the verify URL + the new signup fields
 *      into the GHL contact, and send the SMS.
 *   4. Store the GHL contact id back on the user (best-effort).
 * A GHL failure never blocks account creation.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db, recipients, tippers, PAYMENT_APPS } from '@/lib/db';
import { createRecipient } from '@/lib/db/recipients';
import { checkHandle } from '@/lib/reserved-handles';
import { issueMagicLink } from '@/lib/auth/magic-link';
import { toE164 } from '@/lib/phone';
import { INDUSTRY_SLUGS, OTHER_SLUG, industryLabel } from '@/lib/industries';

export const runtime = 'nodejs';

const ZIP_RE = /^\d{5}(-\d{4})?$/;
const NOW_YEAR = new Date().getFullYear();

const BaseFields = {
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  phone: z.string().min(7).max(40),
  email: z.string().email().max(160),
  // Home ZIP — regional analytics (common-required per the signup spec).
  homeZip: z.string().regex(ZIP_RE, 'Enter a valid ZIP code'),
  // Birth year — age-cohort analytics. Bounded: 18+ and a sane floor.
  birthYear: z
    .number()
    .int()
    .min(NOW_YEAR - 120, 'Enter a valid birth year')
    .max(NOW_YEAR - 18, 'You must be 18 or older'),
  // Shared industry taxonomy — validated against the canonical slug list.
  primaryIndustry: z.enum(INDUSTRY_SLUGS),
  // Free-text only meaningful when industry === 'other'.
  industryOther: z.string().max(60).optional(),
  smsConsent: z.literal(true, {
    errorMap: () => ({ message: 'SMS consent is required to receive your magic link.' }),
  }),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must be 18+ and accept the Terms to continue.' }),
  }),
};

const RecipientSchema = z.object({
  role: z.literal('recipient'),
  handle: z.string().min(2).max(30),
  // Workplace NAME required at signup (anti-fraud anchor + workplace mapping);
  // address/phone are editable later.
  workplaceName: z.string().min(1).max(120),
  ...BaseFields,
});
const TipperSchema = z.object({
  role: z.literal('tipper'),
  usesApps: z.array(z.enum(PAYMENT_APPS)).max(3).optional().default([]),
  ...BaseFields,
});
const BodySchema = z
  .discriminatedUnion('role', [RecipientSchema, TipperSchema])
  .superRefine((val, ctx) => {
    // "Other" industry must carry a description, or it's a dead analytics row.
    if (val.primaryIndustry === OTHER_SLUG && !(val.industryOther && val.industryOther.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['industryOther'],
        message: 'Tell us the industry.',
      });
    }
  });

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const displayName = `${data.firstName} ${data.lastName}`.trim();

  // Normalize phone to E.164 at the boundary — carriers/GHL route on it.
  const phoneE164 = toE164(data.phone);
  if (!phoneE164) {
    return NextResponse.json(
      { error: 'Enter a valid phone number (e.g. (831) 555-0147).', field: 'phone' },
      { status: 422 },
    );
  }

  // Normalize the analytics fields once, used for both DB + GHL.
  const homeZip = data.homeZip.trim();
  const primaryIndustry = data.primaryIndustry;
  const industryOther =
    primaryIndustry === OTHER_SLUG ? (data.industryOther ?? '').trim() || null : null;
  const industryDisplay = industryLabel(primaryIndustry, industryOther);

  if (data.role === 'recipient') {
    const handle = data.handle.toLowerCase();

    const handleProblem = checkHandle(handle);
    if (handleProblem) {
      return NextResponse.json({ error: handleProblem, field: 'handle' }, { status: 422 });
    }

    const existing = await db
      .select({ id: recipients.id })
      .from(recipients)
      .where(eq(recipients.handle, handle))
      .limit(1);
    if (existing[0]) {
      return NextResponse.json(
        { error: 'That handle is already taken.', field: 'handle' },
        { status: 409 },
      );
    }

    const recipient = await createRecipient({
      handle,
      displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: phoneE164,
      email: data.email,
      termsAcceptedAt: new Date(),
      workplaceName: data.workplaceName.trim(),
      apps: [], // added during profile completion
    });

    // Set the new analytics columns in one follow-up write (keeps the
    // data-access layer untouched; signup is not a hot path).
    await db
      .update(recipients)
      .set({ homeZip, birthYear: data.birthYear, primaryIndustry, industryOther, updatedAt: new Date() })
      .where(eq(recipients.id, recipient.id));

    const magic = await issueMagicLink({
      userId: recipient.id,
      role: 'recipient',
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: phoneE164,
      homeZip,
      primaryIndustryLabel: industryDisplay,
      workplaceName: data.workplaceName.trim(),
      tag: 'recipient-signup',
      kind: 'signup',
    });

    if (magic.ghlContactId) {
      await db
        .update(recipients)
        .set({ ghlContactId: magic.ghlContactId })
        .where(eq(recipients.id, recipient.id));
    }

    const origin = (process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'https://pop.tips').replace(/\/$/, '');
    return NextResponse.json({
      ok: true,
      role: 'recipient',
      handle: recipient.handle,
      profileUrl: `${origin}/${recipient.handle}`,
      qrUrl: recipient.qrUrl,
      ghlPushed: magic.ghlPushed,
    });
  }

  // Tipper
  const inserted = await db
    .insert(tippers)
    .values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: phoneE164,
      homeZip,
      birthYear: data.birthYear,
      primaryIndustry,
      industryOther,
      usesApps: data.usesApps,
      termsAcceptedAt: new Date(),
    })
    .returning({ id: tippers.id });

  const tipperId = inserted[0].id;

  const magic = await issueMagicLink({
    userId: tipperId,
    role: 'tipper',
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: phoneE164,
    homeZip,
    primaryIndustryLabel: industryDisplay,
    tag: 'tipper-signup',
    kind: 'signup',
  });

  if (magic.ghlContactId) {
    await db.update(tippers).set({ ghlContactId: magic.ghlContactId }).where(eq(tippers.id, tipperId));
  }

  return NextResponse.json({ ok: true, role: 'tipper', tipperId, ghlPushed: magic.ghlPushed });
}
