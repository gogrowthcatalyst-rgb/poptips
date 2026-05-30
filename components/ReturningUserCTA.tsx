'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Renders a small "Pop me back in to my Account" link on the home page,
 * but ONLY for visitors whose browser has the `poptips:hasAccount` flag set
 * (a flag we write whenever a user reaches their dashboard — i.e. they're
 * already a member on this device).
 *
 * Why client-side localStorage and not a cookie check on the server: the
 * "no-login" voice of the product hinges on us NOT making logged-out users
 * see "Sign in" copy. The flag is a soft signal — present only on devices
 * that have completed at least one signup-to-dashboard round trip — so the
 * home page stays clean for brand-new visitors.
 */
export function ReturningUserCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem('poptips:hasAccount') === '1') {
        setShow(true);
      }
    } catch {
      // localStorage blocked (incognito, third-party blocked, etc) — silently
      // skip; the user will still see the regular signup CTAs.
    }
  }, []);

  if (!show) return null;

  return (
    <p className="mt-5 text-sm text-ink-dim">
      Already with us?{' '}
      <Link
        href="/account"
        className="font-medium text-ink underline decoration-gold-500 decoration-2 underline-offset-4 transition-colors hover:text-accent"
      >
        Pop me back in to my Account →
      </Link>
    </p>
  );
}
