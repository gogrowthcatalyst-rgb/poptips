/**
 * /zelle — retired.
 *
 * Zelle was removed as a supported rail (no public deep-link API; the user
 * experience over-promised vs. what we could actually deliver). The rail is
 * gone from the PaymentApp type, the picker registry, and the deep-link
 * builder. This route is kept only to catch stale bookmarks / old shared
 * links and bounce them home, rather than 404. See lib/payment-apps.ts for
 * the "why three rails" rationale.
 */

import { redirect } from 'next/navigation';

export default function ZelleRetired() {
  redirect('/');
}
