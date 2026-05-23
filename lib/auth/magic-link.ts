/**
 * Magic-link issuance — one place that both signup and resend call.
 *
 * Issues a token, builds the /auth/verify URL, and writes it to the contact's
 * `magic_link_url` custom field in GHL (by key) along with a tag the GHL
 * workflow listens on to actually send the SMS.
 *
 * Best-effort on the GHL side (never fatal): if the push fails, the token
 * still exists and the user can request a resend.
 */

import { createMagicToken, type MagicRole } from '@/lib/auth/tokens';
import { upsertGhlContact } from '@/lib/ghl';

export interface IssueMagicLinkInput {
  userId: string;
  role: MagicRole;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  /** Tag the GHL workflow triggers on. */
  tag: string;
}

export interface IssueMagicLinkResult {
  token: string;
  url: string;
  ghlPushed: boolean;
  ghlContactId?: string;
}

function appOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'https://pop.tips').replace(/\/$/, '');
}

export async function issueMagicLink(input: IssueMagicLinkInput): Promise<IssueMagicLinkResult> {
  const token = await createMagicToken(input.userId, input.role);
  const url = `${appOrigin()}/auth/verify?token=${token}`;

  const ghl = await upsertGhlContact({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    tags: [`poptips-${input.role}`, input.tag],
    customFields: [{ key: 'magic_link_url', value: url }],
  });

  return { token, url, ghlPushed: ghl.ok, ghlContactId: ghl.contactId };
}
