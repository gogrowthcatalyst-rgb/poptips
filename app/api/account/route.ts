/**
 * PATCH /api/account
 *
 * Session-gated, role-aware save of the user's own editable profile fields.
 * Identity comes from the verified session — NEVER from the request body, so
 * a user can only edit themselves. Partial by design: only the keys present
 * in the body are written (see lib/db/profile.ts).
 *
 * Deliberately NOT here (these change where money/identity points, so they go
 * through the SMS step-up flow in the handle-change chunk):
 *   - the public handle
 *   - payment-app handles
 *   - the recipient photo (its own multipart endpoint: /api/upload/photo)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/server';
import {
  updateRecipientEditable,
  updateTipperEditable,
} from '@/lib/db/profile';
import { INDUSTRY_SLUGS, OTHER_SLUG } from '@/lib/industries';
import { PAYMENT_APPS } from '@/lib/db';

export const runtime = 'nodejs';

const ZIP_RE = /^\d{5}(-\d{4})?$/;
const NOW_YEAR = new Date().getFullYear();

// All fields optional (partial edit). Industry, when sent, must be a known
// slug; ZIP, when sent, must look like a ZIP. Required fields (workplaceName,
// names) cannot be blanked — min(1) when present.
const Common = {
  firstName: z.string().min(1).max(60).optional(),
  lastName: z.string().min(1).max(60).optional(),
  primaryIndustry: z.enum(INDUSTRY_SLUGS).optional(),
  industryOther: z.string().max(60).nullable().optional(),
  homeZip: z.string().regex(ZIP_RE, 'Enter a valid ZIP code').optional(),
  birthYear: z
    .number()
    .int()
    .min(NOW_YEAR - 120, 'Enter a valid birth year')
    .max(NOW_YEAR - 18, 'You must be 18 or older')
    .optional(),
};

const RecipientPatch = z.object({
  role: z.literal('recipient'),
  message: z.string().max(280).nullable().optional(),
  serviceRole: z.string().max(80).nullable().optional(), // the recipient's "role" column
  workplaceName: z.string().min(1).max(120).optional(),
  workplaceAddress: z.string().max(200).nullable().optional(),
  workplacePhone: z.string().max(40).nullable().optional(),
  ...Common,
});

const TipperPatch = z.object({
  role: z.literal('tipper'),
  usesApps: z.array(z.enum(PAYMENT_APPS)).max(3).optional(),
  ...Common,
});

const BodySchema = z
  .discriminatedUnion('role', [RecipientPatch, TipperPatch])
  .superRefine((val, ctx) => {
    // If they switch industry TO "other", a description must come with it.
    if (val.primaryIndustry === OTHER_SLUG && val.industryOther !== undefined) {
      const t = (val.industryOther ?? '').trim();
      if (!t) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['industryOther'],
          message: 'Tell us the industry.',
        });
      }
    }
  });

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

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

  // The body's role must match the session's role — you edit your own kind.
  if (data.role !== session.role) {
    return NextResponse.json({ error: 'Role mismatch.' }, { status: 403 });
  }

  // Normalize "other" handling: clear the free-text whenever industry is set
  // to something other than "other".
  const industryOther =
    data.primaryIndustry === undefined
      ? undefined
      : data.primaryIndustry === OTHER_SLUG
        ? (data.industryOther ?? '').trim() || null
        : null;

  try {
    if (data.role === 'recipient') {
      await updateRecipientEditable(session.userId, {
        firstName: data.firstName,
        lastName: data.lastName,
        message: data.message,
        role: data.serviceRole,
        primaryIndustry: data.primaryIndustry,
        industryOther,
        homeZip: data.homeZip,
        birthYear: data.birthYear,
        workplaceName: data.workplaceName,
        workplaceAddress: data.workplaceAddress,
        workplacePhone: data.workplacePhone,
      });
    } else {
      await updateTipperEditable(session.userId, {
        firstName: data.firstName,
        lastName: data.lastName,
        primaryIndustry: data.primaryIndustry,
        industryOther,
        homeZip: data.homeZip,
        birthYear: data.birthYear,
        usesApps: data.usesApps,
      });
    }
  } catch {
    return NextResponse.json({ error: 'Could not save changes.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
