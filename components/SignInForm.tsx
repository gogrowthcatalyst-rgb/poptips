'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * SignInForm — phone-based magic-link request.
 *
 * Mirrors ResendForm's structure (used by /auth/expired) but takes a phone
 * number instead of an email. Lookup is privacy-neutral: the API always
 * returns success, never reveals whether the phone matched a real account.
 *
 * Brand voice: this is "no-login" by design — we're not signing them in
 * here, we're texting them a link that does. The button copy reflects that.
 */
export function SignInForm() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (sending) return;
    // Strip everything but digits to count. Server does real E.164
    // normalization; we just sanity-check at the client.
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter the phone you signed up with');
      return;
    }
    setError(null);
    setSending(true);
    try {
      await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      setSent(true);
    } catch {
      // Always show sent — privacy-neutral, no enumeration leak.
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-jade-100 bg-jade-50/40 px-5 py-5 text-center">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider2 text-jade-700">
          Check your texts
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-dim">
          If that number matches an account, a sign-in link is on its way.
          Tap it on whichever device you want to be in on. Links last 15 minutes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-wider2 text-ink-dim">
          Your phone number
        </span>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          className={cn(
            'w-full rounded-xl border-2 bg-paper px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent',
            error ? 'border-[#B23A2E]' : 'border-line',
          )}
        />
      </label>
      {error ? (
        <p className="text-xs leading-relaxed text-[#B23A2E]">{error}</p>
      ) : null}
      <button
        type="button"
        onClick={submit}
        disabled={sending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3.5 font-display text-base font-medium text-ink shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-gold-700 hover:text-paper active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? 'Sending…' : (
          <>
            Pop me back in to my Account
            <span aria-hidden>→</span>
          </>
        )}
      </button>
      <p className="font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
        No password. We text you a one-tap link.
      </p>
    </div>
  );
}
