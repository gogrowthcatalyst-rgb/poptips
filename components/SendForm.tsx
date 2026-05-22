'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { track } from '@/lib/analytics';
import { buildDeepLink } from '@/lib/deep-links';
import { PAYMENT_APP_META } from '@/lib/payment-apps';
import type { PaymentApp } from '@/lib/payment-apps';

interface RecipientApp {
  app: PaymentApp;
  appHandle: string;
}

interface Props {
  handle: string;
  displayName: string;
  /** The recipient's connected payment apps, in display order */
  apps: RecipientApp[];
}

const PRESETS = [5, 10, 20, 50] as const;

/**
 * The send-page form. Owns amount + app picker state. On app tap:
 *   1. Logs the tip event to /api/tips (status 'initiated') — fire and forget
 *   2. Fires the tip_app_opened analytics event
 *   3. Deep-links into the chosen payment app with handle + amount prefilled
 *
 * Pop Tips never touches the money — the customer confirms inside their app.
 */
export function SendForm({ handle, apps }: Props) {
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

  const openApp = (appHandle: string, appId: PaymentApp) => {
    if (amount === null) return;

    const url = buildDeepLink({ app: appId, appHandle, amount });
    if (!url) return;

    track('tip_app_opened', { handle, app: appId, amount });

    // Log the tip event — fire and forget; never block the handoff.
    const amountCents = Math.round(amount * 100);
    void fetch('/api/tips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle, app: appId, amountCents }),
      keepalive: true,
    }).catch(() => {
      /* non-fatal — the tip still opens */
    });

    // Hand off to the payment app.
    window.location.href = url;
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
          We open the app pre-filled with your amount. You confirm and send.
        </p>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {apps.map((opt) => {
            const meta = PAYMENT_APP_META[opt.app];
            return (
              <li key={opt.app}>
                <button
                  type="button"
                  onClick={() => openApp(opt.appHandle, opt.app)}
                  disabled={amount === null}
                  className="flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-line bg-paper px-6 py-5 text-left transition-all duration-200 ease-out-soft hover:-translate-y-0.5 hover:border-accent hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="font-display text-xl font-medium text-ink md:text-2xl">
                    {meta.label}
                  </span>
                  {meta.subtitle && (
                    <span className="font-mono text-[10px] font-medium uppercase tracking-wider2 text-accent">
                      {meta.subtitle}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
