/**
 * Deep links — the architectural heart of Pop Tips.
 *
 * Each builder constructs a URL that, tapped on a phone, opens the user's
 * own payment app targeted at the recipient. Cash App and PayPal pre-fill the
 * amount too; Venmo only targets the person (see below). The customer confirms
 * inside their app. Pop Tips never touches the money.
 *
 * Per-app link strategy (they are NOT the same — Venmo is the odd one out):
 *
 *  - Venmo: the web profile link `https://venmo.com/u/USERNAME`. We tried the
 *    documented app-schemes (venmo://paycharge?recipients= and venmo://users/)
 *    and verified empirically that Venmo IGNORES an externally-tapped payment
 *    target (an anti-phishing measure) and dumps the tipper on a generic pay
 *    screen. The web profile link is the only thing that reliably lands them on
 *    the CORRECT person's pay screen, and it degrades gracefully to a web page
 *    if the app isn't installed (no dead-end). Tradeoff: Venmo can't pre-fill
 *    the amount this way, so the send page shows the amount prominently for the
 *    tipper to type. Username is case-insensitive; only hyphenation must match.
 *
 *  - Cash App / PayPal: documented https path links where the handle lives in
 *    the PATH (cash.app/$tag/amt, paypal.me/handle/amt). Because the handle is
 *    in the path (not a query param) these open the native app pre-filled and
 *    fall back to web cleanly, so they keep the https form.
 *
 * Handle normalization strips any prefix the worker may have typed
 * (@, $, paypal.me/) so we store and build links from the bare handle.
 */

import type { PaymentApp } from '@/lib/db/schema';

/** Strip leading @, $, and paypal.me/ noise; trim whitespace. */
export function normalizeHandle(app: PaymentApp, raw: string): string {
  let h = raw.trim();
  switch (app) {
    case 'venmo':
      h = h.replace(/^@+/, '');
      break;
    case 'cashapp':
      h = h.replace(/^\$+/, '');
      break;
    case 'paypal':
      // accept "paypal.me/name", "https://paypal.me/name", or bare "name"
      h = h.replace(/^https?:\/\//i, '').replace(/^paypal\.me\//i, '').replace(/^@+/, '');
      break;
  }
  return h;
}

/** Format a dollar amount for URL paths/params. 20 -> "20", 12.5 -> "12.50". */
function formatAmount(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '';
  // Whole dollars render without decimals; otherwise two-decimal.
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

export interface DeepLinkParams {
  app: PaymentApp;
  /** The recipient's handle for this app (raw or normalized — we normalize) */
  appHandle: string;
  /** Dollar amount (e.g. 20 or 12.5). Optional — some apps still work without. */
  amount?: number | null;
  /** Optional note. Only Venmo supports a prefilled note via URL. */
  note?: string;
}

/**
 * Build the deep link for a given app + handle + amount.
 * Returns a string URL, or null if the handle is empty.
 */
export function buildDeepLink({ app, appHandle, amount, note }: DeepLinkParams): string | null {
  const handle = normalizeHandle(app, appHandle);
  if (!handle) return null;

  const amt = amount != null ? formatAmount(amount) : '';

  switch (app) {
    case 'venmo': {
      // Venmo deliberately ignores a pre-filled payment target handed to it
      // from a third-party tap (anti-phishing), so venmo://paycharge?recipients=
      // and venmo://users/ both dump the tipper on a generic pay screen — we
      // verified this empirically across casings/hyphenation. The ONE thing
      // that reliably lands them on the correct person's pay screen is Venmo's
      // own web profile link, which also degrades gracefully (a web page, not
      // an "address is invalid" dead-end) when the app isn't installed.
      //
      // Tradeoff we accept: Venmo can't pre-fill the AMOUNT this way. The send
      // page shows the amount prominently so the tipper types it. Cash App and
      // PayPal still pre-fill amount because their handle+amount live in the URL
      // path, which those apps honor. Username is case-insensitive here; only
      // the hyphenation must match the real Venmo username.
      return `https://venmo.com/u/${encodeURIComponent(handle)}`;
    }

    case 'cashapp': {
      // Cash App: https://cash.app/$cashtag/AMOUNT  (amount optional)
      // No note param supported via URL.
      return amt
        ? `https://cash.app/$${encodeURIComponent(handle)}/${amt}`
        : `https://cash.app/$${encodeURIComponent(handle)}`;
    }

    case 'paypal': {
      // PayPal.Me: https://paypal.me/handle/AMOUNTUSD  (amount optional)
      // No note param supported via URL.
      return amt
        ? `https://paypal.me/${encodeURIComponent(handle)}/${amt}USD`
        : `https://paypal.me/${encodeURIComponent(handle)}`;
    }

    default:
      return null;
  }
}
