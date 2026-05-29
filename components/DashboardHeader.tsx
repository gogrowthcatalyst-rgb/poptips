import Link from 'next/link';

/**
 * AccountLink — the one missing piece of the authenticated app.
 *
 * Until now, dashboards had no entry point to /account, so a returning user
 * had no way to edit their own profile from inside the app. This is the
 * minimum-viable nav: a single clear Account pill that drops cleanly into
 * the existing welcome-row's flex layout on both dashboards.
 */
export function AccountLink() {
  return (
    <Link
      href="/account"
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim transition-colors duration-200 hover:border-accent hover:text-accent"
    >
      Account
      <span aria-hidden>→</span>
    </Link>
  );
}
