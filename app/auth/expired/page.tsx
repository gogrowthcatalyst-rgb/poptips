import { SignInForm } from '@/components/SignInForm';
import { Logo } from '@/components/Logo';

export const metadata = {
  title: 'Link expired',
  description: 'Your magic link has expired. Request a fresh one.',
};

const REASON_COPY: Record<string, { headline: string; detail: string }> = {
  'no-token': {
    headline: 'No sign-in token.',
    detail: 'That link came in without the secure token attached. Try requesting a fresh one.',
  },
  'no-form': {
    headline: 'Couldn’t read the request.',
    detail: 'The sign-in request didn’t arrive cleanly. Try again — this is usually a hiccup, not a real problem.',
  },
  'token-invalid': {
    headline: 'That link can’t be used.',
    detail:
      'Either it expired (links last 15 minutes), it was already used, or a link-preview scanner consumed it before you tapped. Tap below for a fresh one.',
  },
  'session-secret-missing': {
    headline: 'Server isn’t fully configured.',
    detail:
      'The sign-in succeeded but the server can’t hand you a session cookie yet. This is a config issue on our side — please ping us if it keeps happening.',
  },
  'business-user-missing': {
    headline: 'Business account not found.',
    detail:
      'The link is for a business account that no longer exists. Try requesting a fresh one or signing up again.',
  },
};

export default async function AuthExpiredPage({
  searchParams,
}: {
  searchParams: Promise<{ why?: string }>;
}) {
  const { why } = await searchParams;
  const reason = why && REASON_COPY[why] ? REASON_COPY[why] : null;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-line-soft bg-surface p-8 shadow-md md:p-10">
        <Logo variant="icon" height={40} className="mx-auto mb-5 opacity-60" alt="Pop Tips" />
        <h1 className="text-center font-display text-3xl font-medium italic leading-tight text-ink">
          {reason ? reason.headline : 'That link has expired.'}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-center text-base leading-relaxed text-ink-dim">
          {reason
            ? reason.detail
            : 'Magic links last 15 minutes for your security. Enter your phone and we’ll text you a fresh one.'}
        </p>

        <div className="mt-8">
          <SignInForm />
        </div>

        {/* Diagnostic crumb — visible only when a reason is passed, helps
            ground-truth-debug what's actually happening server-side. */}
        {why ? (
          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
            reason: {why}
          </p>
        ) : null}
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-ink-faint">
        Already in on another tab? You can close this and keep going.
      </p>
    </main>
  );
}
