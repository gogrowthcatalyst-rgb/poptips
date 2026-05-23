/**
 * Magic-link issuance — one place that both signup and resend call.
 *
 * Issues a token, builds the /auth/verify URL, writes it to the contact's
 * `magic_link_url` field (for CRM/visibility), and SENDS THE SMS DIRECTLY via
 * the GHL Conversations API.
 *
 * The direct send replaces the old tag→workflow trigger path. A magic link is
 * a transactional auth message — it must send synchronously, every time, on a
 * path we control and can see in logs. Tags/fields are still written so GHL
 * has the data for drips/marketing, but delivery no longer depends on a
 * workflow firing.
 */

import { createMagicToken, type MagicRole } from '@/lib/auth/tokens';
import { upsertGhlContact, sendGhlSms } from '@/lib/ghl';

export type MagicLinkKind = 'signup' | 'resend';

export interface IssueMagicLinkInput {
  userId: string;
  role: MagicRole;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  /** Tag applied for CRM/segmentation (not used for delivery anymore). */
  tag: string;
  kind: MagicLinkKind;
}

export interface IssueMagicLinkResult {
  token: string;
  url: string;
  ghlPushed: boolean;
  ghlContactId?: string;
  smsSent: boolean;
}

function appOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'https://pop.tips').replace(/\/$/, '');
}

function buildMessage(kind: MagicLinkKind, url: string): string {
  if (kind === 'resend') {
    return `Your new Pop Tips link: ${url} — reply STOP to opt out.`;
  }
  return `Welcome to Pop Tips! Tap to confirm your account: ${url} — reply STOP to opt out.`;
}

export async function issueMagicLink(input: IssueMagicLinkInput): Promise<IssueMagicLinkResult> {
  const token = await createMagicToken(input.userId, input.role);
  const url = `${appOrigin()}/auth/verify?token=${token}`;

  // Upsert the contact (tags + magic_link_url field) — gives us the contactId.
  const ghl = await upsertGhlContact({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    tags: [`poptips-${input.role}`, input.tag],
    customFields: [{ key: 'magic_link_url', value: url }],
  });

  // Send the magic link directly. This is the delivery path now.
  let smsSent = false;
  if (ghl.contactId) {
    const sms = await sendGhlSms(ghl.contactId, buildMessage(input.kind, url));
    smsSent = sms.ok;
  } else {
    console.error('[auth] no GHL contactId — cannot send magic link SMS.');
  }

  return { token, url, ghlPushed: ghl.ok, ghlContactId: ghl.contactId, smsSent };
}
