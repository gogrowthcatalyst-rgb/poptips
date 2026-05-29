'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { track } from '@/lib/analytics';
import { buildDeepLink } from '@/lib/deep-links';
import { PAYMENT_APP_META } from '@/lib/payment-apps';
import type { PaymentApp } from '@/lib/payment-apps';
import { PopCelebrate } from './PopCelebrate';

/**
 * Send flow — bulletproofed (Power of Ten aligned).
 *
 * Design contract: a tipper must ALWAYS be able to complete a tip, even if
 * the deep link does nothing (app not installed, OS won't hand off, etc.).
 * So selecting an app reveals BOTH:
 *   1. a one-tap deep link (best case — opens the app pre-filled), and
 *   2. an always-visible manual fallback: the exact handle + amount + copy
 *      buttons, with plain instructions.
 * There is no code path that leaves the user on a dead end.
 *
 * Rule notes:
 *  - Simple control flow, no recursion, bounded iteration over a fixed
 *    1–3 element app list.
 *  - Inputs validated at the boundary: amount must be a finite number > 0;
 *    a deep link is only offered when buildDeepLink returns non-null.
 *  - Every async return value (clipboard) is checked / caught.
 *  - No undefined UI states: no amount -> apps disabled; no selection ->
 *    no confirm panel; empty handle -> manual-only (no broken link).
 */

interface RecipientApp {
  app: PaymentApp;
  appHandle: string;
}

interface Props {
  handle: string;
  displayName: string;
  apps: RecipientApp[];
}

const PRESETS = [5, 10, 20, 50] as const;
const MAX_TIP = 100_000; // sanity ceiling, matches API validation

/** Format a dollar amount for display. 20 -> "20", 12.5 -> "12.50". */
function formatAmount(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export function SendForm({ handle, displayName, apps }: Props) {
  const [amount, setAmount] = useState<number | null>(20);
  const [customRaw, setCustomRaw] = useState<string>('');
  const [usingCustom, setUsingCustom] = useState(false);
  const [selectedApp, setSelectedApp] = useState<PaymentApp | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

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
    if (!Number.isNaN(n) && n > 0 && n <= MAX_TIP) {
      setAmount(n);
      track('tip_amount_selected', { handle, amount: n, method: 'custom' });
    } else {
      setAmount(null);
    }
  };

  const selectApp = (appId: PaymentApp) => {
    if (amount === null) return;
    setSelectedApp(appId);
    setCopied(null);
  };

  /** Log the tip the moment the user commits to opening an app. */
  const logTip = (appId: PaymentApp) => {
    if (amount === null) return;
    track('tip_app_opened', { handle, app: appId, amount });
    const amountCents = Math.round(amount * 100);
    void fetch('/api/tips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle, app: appId, amountCents }),
      keepalive: true,
    }).catch(() => {
      /* non-fatal — manual fallback still lets the tip complete */
    });
  };

  const copyText = async (label: string, value: string) => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        ok = true;
      }
    } catch {
      ok = false;
    }
    setCopied(ok ? label : null);
    if (ok) window.setTimeout(() => setCopied((c) => (c === label ? null : c)), 1800);
  };

  const selectedRecipientApp = selectedApp
    ? apps.find((a) => a.app === selectedApp) ?? null
    : null;

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

        {/* Copy the amount before tapping Venmo — Venmo strips amount prefill on
            external taps, so the tipper pastes it after the app opens. The tap
            stays under your control, the number doesn't get mistyped. */}
        {amount !== null && amount > 0 ? (
          <button
            type="button"
            onClick={() => copyText('amt-pre', formatAmount(amount))}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-line bg-paper px-5 py-3 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim transition-all duration-200 ease-out-soft hover:border-accent hover:text-accent active:scale-[0.98] md:w-auto"
            aria-label={`Copy $${formatAmount(amount)} to clipboard`}
          >
            {copied === 'amt-pre' ? (
              <>Copied · ${formatAmount(amount)} ready to paste</>
            ) : (
              <>Copy ${formatAmount(amount)} for Venmo →</>
            )}
          </button>
        ) : null}
      </section>

      {/* APP PICKER ================================================= */}
      <section
        aria-labelledby="app-heading"
        className="mt-6 rounded-3xl border border-line bg-surface p-6 shadow-lift md:mt-8 md:p-8"
      >
        <h2
          id="app-heading"
          className="font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint"
        >
          Choose an app
        </h2>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {apps.map((opt) => {
            const meta = PAYMENT_APP_META[opt.app];
            const active = selectedApp === opt.app;
            return (
              <li key={opt.app}>
                <button
                  type="button"
                  onClick={() => selectApp(opt.app)}
                  disabled={amount === null}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 px-6 py-5 text-left transition-all duration-200 ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-glow active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
                    active
                      ? 'border-accent bg-accent-glow/20 shadow-lift'
                      : 'border-line bg-paper hover:-translate-y-0.5 hover:border-accent hover:shadow-lift',
                  )}
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

      {/* CONFIRM + GUARANTEED FALLBACK ============================== */}
      {selectedRecipientApp && amount !== null && (
        <ConfirmPanel
          appId={selectedRecipientApp.app}
          appHandle={selectedRecipientApp.appHandle}
          amount={amount}
          displayName={displayName}
          copied={copied}
          onOpen={() => logTip(selectedRecipientApp.app)}
          onCopy={copyText}
        />
      )}
    </>
  );
}

/* ─────────────────────────── CONFIRM PANEL ───────────────────────── */

function ConfirmPanel({
  appId,
  appHandle,
  amount,
  displayName,
  copied,
  onOpen,
  onCopy,
}: {
  appId: PaymentApp;
  appHandle: string;
  amount: number;
  displayName: string;
  copied: string | null;
  onOpen: () => void;
  onCopy: (label: string, value: string) => void;
}) {
  const meta = PAYMENT_APP_META[appId];
  const amountStr = formatAmount(amount);
  const deepLink = buildDeepLink({ app: appId, appHandle, amount });
  const prefixed = `${meta.handlePrefix}${appHandle}`;

  // Brand-mnemonic celebration on tap: visual + audio play BEFORE the deep
  // link fires, so the tipper hears pop/cha-ching at the moment of giving.
  // The redirect waits the celebration window so the moment isn't cut off
  // by the OS handing control to the payment app.
  const [celebrating, setCelebrating] = useState(false);
  const handleOpen = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!deepLink) return; // shouldn't happen — guarded above
    e.preventDefault();
    onOpen(); // logs the tip immediately
    setCelebrating(true);
    window.setTimeout(() => {
      window.location.href = deepLink;
    }, 1100);
  };

  return (
    <section
      aria-label={`Send ${meta.label}`}
      className="mt-6 rounded-3xl border-2 border-accent bg-surface p-6 shadow-lift md:p-8"
    >
      {/* Primary: one-tap deep link (best case) */}
      {deepLink ? (
        <PopCelebrate
          play={celebrating}
          message="Tip sent."
          audioSrc="/sounds/tip-celebrate.mp3"
          pieces={20}
          spread={180}
        >
          <a
            href={deepLink}
            onClick={handleOpen}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-5 text-center font-display text-xl font-medium text-paper shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-accent-dim active:scale-[0.98] md:text-2xl"
          >
            Open {meta.label} to send{' '}
            <span className="money font-semibold">${amountStr}</span>
          </a>
        </PopCelebrate>
      ) : null}

      {/* Guaranteed manual fallback — ALWAYS shown, never a dead end. */}
      <div className="mt-5">
        <p className="text-center font-mono text-[11px] font-medium uppercase tracking-wider2 text-ink-faint">
          {deepLink ? "Didn't open? Send it yourself" : `Send in ${meta.label}`}
        </p>

        <div className="mt-3 space-y-2">
          {/* Handle row */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
                {meta.label} handle
              </p>
              <p className="truncate font-mono text-base font-medium text-ink">
                {prefixed}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCopy('handle', appHandle)}
              className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim transition-colors hover:border-accent hover:text-accent"
            >
              {copied === 'handle' ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Amount row */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
                Amount
              </p>
              <p className="money truncate text-base font-semibold text-ink">
                ${amountStr}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCopy('amount', amountStr)}
              className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim transition-colors hover:border-accent hover:text-accent"
            >
              {copied === 'amount' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-sm leading-relaxed text-ink-faint">
          Open {meta.label}, search{' '}
          <span className="font-mono text-ink-dim">{prefixed}</span>, and send{' '}
          <span className="money font-semibold text-ink-dim">${amountStr}</span> to{' '}
          {displayName}.
        </p>
      </div>
    </section>
  );
}
