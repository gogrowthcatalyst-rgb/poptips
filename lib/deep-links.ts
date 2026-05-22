/**
 * Deep links — the architectural heart of Pop Tips.
 *
 * Each builder constructs a URL that, tapped on a phone, opens the user's
 * own payment app with the recipient and amount pre-filled. The customer
 * confirms inside their app. Pop Tips never touches the money.
 *
 * We use each provider's documented WEB-INTENT URL (https://), not the raw
 * app-scheme (venmo://). Web-intent links are more reliable: they open the
 * native app when installed and fall back to the web flow when not, and they
 * don't trigger the "open in app?" browser warnings that bare schemes do.
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
      // Venmo web-intent: opens the app on mobile, web on desktop.
      // https://venmo.com/?txn=pay&recipients=USER&amount=AMT&note=NOTE
      const params = new URLSearchParams({ txn: 'pay', recipients: handle });
      if (amt) params.set('amount', amt);
      if (note) params.set('note', note);
      return `https://venmo.com/?${params.toString()}`;
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
