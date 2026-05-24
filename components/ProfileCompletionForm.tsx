'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { buildDeepLink } from '@/lib/deep-links';
import { PAYMENT_APP_ORDER, PAYMENT_APP_META } from '@/lib/payment-apps';
import type { PaymentApp } from '@/lib/payment-apps';

const ERROR = 'text-[#B23A2E]';
const ERROR_BORDER = 'border-[#B23A2E]';

interface Props {
  handle: string;
  displayName: string;
  initialRole?: string | null;
  initialMessage?: string | null;
  initialPhotoUrl?: string | null;
}

export function ProfileCompletionForm({
  handle,
  displayName,
  initialRole,
  initialMessage,
  initialPhotoUrl,
}: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl ?? null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // One handle field per app; fill what you have.
  const [handles, setHandles] = useState<Record<PaymentApp, string>>({
    venmo: '',
    cashapp: '',
    paypal: '',
  });
  const [tested, setTested] = useState<Record<PaymentApp, boolean>>({
    venmo: false,
    cashapp: false,
    paypal: false,
  });

  const [role, setRole] = useState(initialRole ?? '');
  const [message, setMessage] = useState(initialMessage ?? '');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setHandleFor = (app: PaymentApp, value: string) => {
    setHandles((h) => ({ ...h, [app]: value }));
    setTested((t) => ({ ...t, [app]: false })); // editing invalidates the test
  };

  const testLink = (app: PaymentApp) => {
    const raw = handles[app].trim();
    if (!raw) return;
    const url = buildDeepLink({ app, appHandle: raw }); // no amount — opens their account
    if (!url) return;
    setTested((t) => ({ ...t, [app]: true }));
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const uploadPhoto = async (file: File) => {
    setPhotoError(null);
    setPhotoUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload/photo', { method: 'POST', body: form });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;
      if (!res.ok || !data?.ok || !data.url) {
        setPhotoError(data?.error ?? 'Upload failed. Try a different image.');
      } else {
        setPhotoUrl(data.url);
      }
    } catch {
      setPhotoError('Upload failed. Check your connection and try again.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const filledApps = PAYMENT_APP_ORDER.filter((a) => handles[a].trim().length > 0);

  const submit = async () => {
    if (submitting) return;
    if (filledApps.length === 0) {
      setError('Add at least one payment app so customers can tip you.');
      return;
    }
    setError(null);
    setSubmitting(true);

    const apps = filledApps.map((app, i) => ({
      app,
      appHandle: handles[app].trim(),
      isPrimary: i === 0,
    }));

    try {
      const res = await fetch('/api/recipients/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apps,
          role: role.trim() || undefined,
          message: message.trim() || undefined,
          photoUrl: photoUrl || undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      // Profile is live — go to the dashboard.
      window.location.href = '/dashboard';
    } catch {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* PHOTO */}
      <section>
        <h2 className="font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim">
          Your photo
        </h2>
        <p className="mt-1 text-xs text-ink-faint">
          Optional, but a face earns more tips. JPG, PNG, or WebP, under 5 MB.
        </p>
        <div className="mt-4 flex items-center gap-5">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-line bg-paper">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-3xl font-medium italic text-accent">
                {displayName.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <label className="inline-flex cursor-pointer items-center rounded-full border-2 border-line bg-paper px-5 py-2.5 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim transition-colors hover:border-accent hover:text-accent">
              {photoUploading ? 'Uploading…' : photoUrl ? 'Change photo' : 'Upload photo'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={photoUploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadPhoto(f);
                }}
              />
            </label>
            {photoError && <p className={cn('mt-2 text-xs', ERROR)}>{photoError}</p>}
          </div>
        </div>
      </section>

      {/* PAYMENT APPS */}
      <section>
        <h2 className="font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim">
          Where should tips land?
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-faint">
          Add the apps you use — at least one. Tap{' '}
          <span className="font-medium text-ink-dim">Test</span> to confirm each link opens{' '}
          <em>your</em> account (this catches typos before a tip goes to the wrong person).
        </p>

        <div className="mt-4 space-y-3">
          {PAYMENT_APP_ORDER.map((app) => {
            const meta = PAYMENT_APP_META[app];
            const value = handles[app];
            const hasValue = value.trim().length > 0;
            return (
              <div key={app} className="rounded-2xl border border-line bg-paper p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-medium text-ink">{meta.label}</span>
                  {hasValue && (
                    <button
                      type="button"
                      onClick={() => testLink(app)}
                      className={cn(
                        'rounded-full border px-4 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wider2 transition-colors',
                        tested[app]
                          ? 'border-jade-500 text-jade-700'
                          : 'border-line text-ink-dim hover:border-accent hover:text-accent',
                      )}
                    >
                      {tested[app] ? '✓ Tested' : 'Test it'}
                    </button>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-1 rounded-xl border-2 border-line bg-surface px-3 py-2.5 transition-colors focus-within:border-accent">
                  <span className="shrink-0 font-mono text-sm text-ink-faint">{meta.handlePrefix}</span>
                  <input
                    type="text"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder={meta.handlePlaceholder}
                    value={value}
                    onChange={(e) => setHandleFor(app, e.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent font-mono text-sm font-medium text-ink outline-none placeholder:text-ink-faint"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* TITLE + MESSAGE */}
      <section className="space-y-5">
        <div>
          <label htmlFor="role" className="mb-2 block font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim">
            Your title (optional)
          </label>
          <input
            id="role"
            type="text"
            placeholder="Barista · Blue Bottle"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border-2 border-line bg-paper px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
          />
        </div>
        <div>
          <label htmlFor="message" className="mb-2 block font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim">
            A note for your tippers (optional)
          </label>
          <textarea
            id="message"
            rows={3}
            maxLength={280}
            placeholder="Thanks for stopping by — really appreciate you."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full resize-none rounded-xl border-2 border-line bg-paper px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
          />
        </div>
      </section>

      {error && (
        <p className={cn('rounded-xl border px-4 py-3 text-sm', ERROR, ERROR_BORDER)}>{error}</p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="flex w-full items-center justify-center rounded-full bg-accent px-8 py-4 font-display text-lg font-medium text-paper shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-accent-dim active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 md:text-xl"
      >
        {submitting ? 'Going live…' : 'Finish — make my page live'}
      </button>

      <p className="text-center text-xs leading-relaxed text-ink-faint">
        Your page goes live at{' '}
        <span className="font-mono text-ink-dim">pop.tips/{handle}</span> as soon as you finish.
      </p>
    </div>
  );
}
