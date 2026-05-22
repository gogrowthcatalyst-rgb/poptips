/**
 * Payment apps — single source of truth for the three supported rails.
 *
 * Zelle (no public deep-link API) and Apple Pay / Apple Cash (iOS-only,
 * no deep-link, merchant-centric) are deliberately excluded. See README
 * "Why three rails" and the Poppy KB §7.
 *
 * Every surface that lists payment apps — the send-page picker, the public
 * profile badges, the signup app-picker — imports from here. Change the set
 * in one place.
 */

import type { PaymentApp } from '@/lib/db/schema';

export type { PaymentApp };

export interface PaymentAppMeta {
  id: PaymentApp;
  /** Label as users say it */
  label: string;
  /** Short note shown in the picker, if any */
  subtitle: string;
  /** The prefix users associate with their handle on this app */
  handlePrefix: string;
  /** Placeholder shown in the signup handle field */
  handlePlaceholder: string;
}

export const PAYMENT_APP_META: Record<PaymentApp, PaymentAppMeta> = {
  venmo: {
    id: 'venmo',
    label: 'Venmo',
    subtitle: 'Most common',
    handlePrefix: '@',
    handlePlaceholder: 'your-venmo-username',
  },
  cashapp: {
    id: 'cashapp',
    label: 'Cash App',
    subtitle: '',
    handlePrefix: '$',
    handlePlaceholder: 'yourcashtag',
  },
  paypal: {
    id: 'paypal',
    label: 'PayPal',
    subtitle: '',
    handlePrefix: 'paypal.me/',
    handlePlaceholder: 'your-paypal-me',
  },
};

/** Canonical display order */
export const PAYMENT_APP_ORDER: PaymentApp[] = ['venmo', 'cashapp', 'paypal'];

export function getPaymentAppMeta(app: PaymentApp): PaymentAppMeta {
  return PAYMENT_APP_META[app];
}

export function paymentAppLabel(app: PaymentApp): string {
  return PAYMENT_APP_META[app]?.label ?? app;
}
