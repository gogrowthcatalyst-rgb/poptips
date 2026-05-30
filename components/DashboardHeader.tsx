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
      className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider2 text-ink shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-0.5 hover:bg-gold-700 hover:text-paper active:scale-[0.98]"
    >
      Account
      <span aria-hidden>→</span>
    </Link>
  );
}
