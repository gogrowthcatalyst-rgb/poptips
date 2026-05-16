'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { track } from '@/lib/analytics';

interface Props {
  handle: string;
  displayName: string;
}

const PRESETS = [5, 10, 20, 50] as const;

const APPS = [
  { id: 'venmo',   label: 'Venmo',    subtitle: 'Most common' },
  { id: 'cashapp', label: 'Cash App', subtitle: '' },
  { id: 'paypal',  label: 'PayPal',   subtitle: '' },
  { id: 'zelle',   label: 'Zelle',    subtitle: 'No fees' },
] as const;

type AppId = (typeof APPS)[number]['id'];

/**
 * The send-page form. Owns amount + app picker state, fires the
 * tip_amount_selected and tip_app_opened analytics events.
 *
 * Real deep links wire in Session 5; for now this is the funnel
 * endpoint we measure (profile_viewed → tip_send_started → tip_app_opened).
 */
export function SendForm({ handle }: Props) {
  const [amount, setAmount] = useState<number | null>(20);
  const [customRaw, setCustomRaw] = useState<string>('');
  const [usingCustom, setUsingCustom] = useState(false);

  const pickPreset = (n: number) => {
    setAmount(n);
    setUsingCustom(false);
    setCustomRaw('');
    track('tip_amount_selected', { handle, amount: n, method: 'preset' });
  };

  const pickCustom = (raw: string) => {
    setUsingCustom(true);
    setCustomRaw(raw);
    const cleaned = raw.replace(/[^0-9.]/g, '');
    const n = parseFloat(cleaned);
    if (!Number.isNaN(n) && n > 0) {
      setAmount(n);
      track('tip_amount_selected', { handle, amount: n, method: 'custom' });
    } else {
      setAmount(null);
    }
  };

  const openApp = (appId: AppId) => {
    track('tip_app_opened', { handle, app: appId, amount });
    // Real deep links wire in Session 5.
  };

  return (
    <>
      {/* AMOUNT ===================================================== */}
      <section
        aria-labelledby="amount-heading"
        className="rounded-3xl border border-line bg-surface p-6 shadow-lift md:p-8"
      >
        <h2
          id="amount-heading"
          className="font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint"
        >
          Pick an amount
        </h2>
        <div className="mt-5 grid grid-cols-4 gap-2 md:gap-3">
          {PRESETS.map((n) => {
            const active = !usingCustom && amount === n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => pickPreset(n)}
                className={cn(
                  'money cursor-pointer rounded-2xl border-2 px-3 py-5 text-2xl font-semibold transition-all duration-200 ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-glow active:scale-95 md:py-6 md:text-3xl',
                  active
                    ? 'border-accent bg-accent text-paper shadow-lift hover:bg-accent-dim'
                    : 'border-line bg-paper text-ink hover:-translate-y-0.5 hover:border-accent hover:shadow-lift',
                )}
              >
                ${n}
              </button>
            );
          })}
        </div>

        {/* Custom amount */}
        <label className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-line bg-paper px-5 py-4 transition-colors focus-within:border-accent">
          <span className="font-mono text-sm text-ink-faint">Or custom:</span>
          <span className="money text-lg font-medium text-ink-dim">$</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={customRaw}
            onChange={(e) => pickCustom(e.target.value)}
            className="money flex-1 border-0 bg-transparent text-lg font-medium text-ink outline-none placeholder:text-ink-faint"
          />
        </label>
      </section>

      {/* APP ======================================================== */}
      <section
        aria-labelledby="app-heading"
        className="mt-6 rounded-3xl border border-line bg-surface p-6 shadow-lift md:mt-8 md:p-8"
      >
        <h2
          id="app-heading"
          className="font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint"
        >
          Send via
        </h2>
        <p className="mt-1 text-xs text-ink-faint">
          Real deep links wire in Session 5. Tapping fires an analytics event.
        </p>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {APPS.map((opt) => (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => openApp(opt.id)}
                disabled={amount === null}
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-line bg-paper px-6 py-5 text-left transition-all duration-200 ease-out-soft hover:-translate-y-0.5 hover:border-accent hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="font-display text-xl font-medium text-ink md:text-2xl">
                  {opt.label}
                </span>
                {opt.subtitle && (
                  <span className="font-mono text-[10px] font-medium uppercase tracking-wider2 text-accent">
                    {opt.subtitle}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
