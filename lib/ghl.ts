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

export interface GhlContactInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  /** Tags help GHL workflows decide which automation to run (e.g. magic link) */
  tags?: string[];
  /** Arbitrary custom fields by field id; optional */
  customFields?: { id: string; value: string }[];
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
      return { ok: false, error: `GHL ${res.status}: ${text.slice(0, 200)}` };
    }

    const data = (await res.json().catch(() => null)) as
      | { contact?: { id?: string } }
      | null;

    return { ok: true, contactId: data?.contact?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'GHL request failed' };
  }
}
