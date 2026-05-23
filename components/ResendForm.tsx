'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERROR = 'text-[#B23A2E]';

export function ResendForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (sending) return;
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email');
      return;
    }
    setError(null);
    setSending(true);
    try {
      await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch {
      // Neutral — still show sent to avoid enumeration / dead ends.
      setSent(true);
    }
  };

  if (sent) {
    return (
      <p className="rounded-2xl border border-line bg-paper px-5 py-4 text-center text-sm leading-relaxed text-ink-dim">
        If that email matches an account, a fresh magic link is on its way by
        text. It can take up to a minute.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={cn(
          'w-full rounded-xl border-2 bg-paper px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent',
          error ? 'border-[#B23A2E]' : 'border-line',
        )}
      />
      {error && <p className={cn('text-xs', ERROR)}>{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={sending}
        className="flex w-full items-center justify-center rounded-full bg-accent px-8 py-4 font-display text-lg font-medium text-paper shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-accent-dim active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? 'Sending…' : 'Send me a new link'}
      </button>
    </div>
  );
}
