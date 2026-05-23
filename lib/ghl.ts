/**
 * GoHighLevel API client.
 *
 * Pop Tips owns the signup form natively; GHL is the CRM + SMS/drip engine.
 * After we write a signup to our own database, we push the contact to GHL so
 * marketing/lifecycle automations (including the magic-link SMS workflow) can
 * run there.
 *
 * Design (Power of Ten aligned):
 *  - Never throws into the request path. Returns a typed result the caller
 *    checks. A GHL outage must NOT block account creation — our DB is the
 *    source of truth; GHL is best-effort.
 *  - Reads credentials from env. If absent, no-ops with a clear log and
 *    returns { ok: false, skipped: true } so local/testing works pre-creds.
 *  - Single level of nesting, small surface, explicit return values.
 */

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';
const GHL_CONVERSATIONS_VERSION = '2021-04-15';

export interface GhlContactInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  /** Tags help GHL workflows decide which automation to run (e.g. magic link) */
  tags?: string[];
  /** Custom fields by field id OR key; optional */
  customFields?: ({ id: string; value: string } | { key: string; value: string })[];
}

export interface GhlResult {
  ok: boolean;
  /** true when credentials are absent and the call was intentionally skipped */
  skipped?: boolean;
  contactId?: string;
  error?: string;
}

function getCreds(): { apiKey: string; locationId: string } | null {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!apiKey || !locationId) return null;
  return { apiKey, locationId };
}

/**
 * Create or update a contact in GHL. Best-effort: returns a result the caller
 * inspects but should not treat as fatal.
 */
export async function upsertGhlContact(input: GhlContactInput): Promise<GhlResult> {
  const creds = getCreds();
  if (!creds) {
    // Not configured yet — skip cleanly so signup still works in testing.
    console.warn('[ghl] GHL_API_KEY / GHL_LOCATION_ID not set — skipping contact push.');
    return { ok: false, skipped: true };
  }

  const body = {
    locationId: creds.locationId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    tags: input.tags,
    customFields: input.customFields,
  };

  try {
    const res = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.apiKey}`,
        Version: GHL_API_VERSION,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const error = `GHL ${res.status}: ${text.slice(0, 300)}`;
      console.error(`[ghl] contact upsert failed — ${error}`);
      return { ok: false, error };
    }

    const data = (await res.json().catch(() => null)) as
      | { contact?: { id?: string } }
      | null;

    console.info(`[ghl] contact upsert ok — id=${data?.contact?.id ?? 'unknown'}`);
    return { ok: true, contactId: data?.contact?.id };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'GHL request failed';
    console.error(`[ghl] contact upsert threw — ${error}`);
    return { ok: false, error };
  }
}


/* ─────────────────────────── SEND SMS ────────────────────────────── */

export interface SendSmsResult {
  ok: boolean;
  skipped?: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an SMS to a contact via GHL's Conversations API — directly, synchronously.
 *
 * This is the magic-link delivery path. Unlike a workflow tag-trigger (which can
 * silently skip), this is a direct call we control and log. From-number defaults
 * to the location's configured SMS number; set GHL_SMS_FROM to force a specific
 * one.
 *
 * Best-effort return (never throws): the caller logs/inspects but a failure
 * here should be surfaced loudly (this IS the critical message).
 */
export async function sendGhlSms(contactId: string, message: string): Promise<SendSmsResult> {
  const creds = getCreds();
  if (!creds) {
    console.warn('[ghl] GHL_API_KEY / GHL_LOCATION_ID not set — skipping SMS send.');
    return { ok: false, skipped: true };
  }
  if (!contactId) {
    console.error('[ghl] sendGhlSms called without a contactId — skipping.');
    return { ok: false, error: 'missing contactId' };
  }

  const body: Record<string, unknown> = {
    type: 'SMS',
    contactId,
    message,
  };
  const fromNumber = process.env.GHL_SMS_FROM;
  if (fromNumber) body.fromNumber = fromNumber;

  try {
    const res = await fetch(`${GHL_BASE}/conversations/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${creds.apiKey}`,
        Version: GHL_CONVERSATIONS_VERSION,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const error = `GHL SMS ${res.status}: ${text.slice(0, 300)}`;
      console.error(`[ghl] sms send failed — ${error}`);
      return { ok: false, error };
    }

    const data = (await res.json().catch(() => null)) as
      | { messageId?: string; msg?: string }
      | null;
    console.info(`[ghl] sms sent ok — contact=${contactId} messageId=${data?.messageId ?? 'unknown'}`);
    return { ok: true, messageId: data?.messageId };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'GHL SMS request failed';
    console.error(`[ghl] sms send threw — ${error}`);
    return { ok: false, error };
  }
}
