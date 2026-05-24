/**
 * Deep links — the architectural heart of Pop Tips.
 *
 * Each builder constructs a URL that, tapped on a phone, opens the user's
 * own payment app with the recipient and amount pre-filled. The customer
 * confirms inside their app. Pop Tips never touches the money.
 *
 * Per-app link strategy (they are NOT the same — Venmo is the odd one out):
 *
 *  - Venmo: the app-scheme `venmo://paycharge?txn=pay&recipients=...`. This is
 *    the format Venmo's own QR codes and sample app emit, and it is the only
 *    one that reliably PRE-FILLS the recipient on Android. The web-intent form
 *    (https://venmo.com/?txn=pay&recipients=...) looks tidier and dodges the
 *    "open in app?" prompt, but Android does NOT carry the `recipients` query
 *    param into the app from it — you land on a blank "enter username" pay
 *    screen. We accept the tiny app-open prompt to keep the recipient
 *    pre-filled. If Venmo isn't installed the scheme is a no-op, and the
 *    send page's always-visible manual fallback (copy handle + amount) covers
 *    that case — no dead end.
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
      // App-scheme that actually targets the recipient on iOS AND Android.
      //   venmo://paycharge?txn=pay&recipients=USERNAME&amount=AMT&note=NOTE
      // (recipients may be a username, phone, or email.)
      const params = new URLSearchParams({ txn: 'pay', recipients: handle });
      if (amt) params.set('amount', amt);
      if (note) params.set('note', note);
      return `venmo://paycharge?${params.toString()}`;
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
