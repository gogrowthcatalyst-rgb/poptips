'use client';

import type { Regular } from '@/lib/dashboard/tipper-data';
import { splitDollars } from '@/lib/dashboard/placeholder-data';
import { Sparkles } from '@/components/icons';

const SWATCH_GRADIENTS = {
  coral:        'linear-gradient(135deg, #F06844, #FFA587)',
  jade:         'linear-gradient(135deg, #2C6F57, #6BA589)',
  gold:         'linear-gradient(135deg, #E9A21C, #FFEBC2)',
  violet:       'linear-gradient(135deg, #6B5BFF, #B5AEFF)',
  'coral-dark': 'linear-gradient(135deg, #C44A2C, #F06844)',
} as const;

interface QuickTipCardProps {
  regulars: Regular[];
}

/**
 * QuickTipCard — tipper-side dashboard centerpiece.
 *
 * On the recipient dashboard this is the QR code card; here it's the
 * "your regulars" surface — saved favorites for one-tap re-tipping.
 *
 * Each regular shows: avatar (initials, colored gradient), name + role,
 * three quick-tap amount buttons that use their preferred payment app.
 * Tapping a button (in Session 5 when real plumbing lands) deep-links the
 * tipper into the right app with the recipient handle + amount pre-filled.
 *
 * For Day-1 zero state: empty card with onboarding copy nudging the user
 * to send a few tips before saved regulars appear.
 */
export function QuickTipCard({ regulars }: QuickTipCardProps) {
  const hasRegulars = regulars.length > 0;

  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-jade-100 bg-gradient-to-br from-jade-50 via-paper to-paper p-7 shadow-lift md:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-jade-100 opacity-55 blur-3xl"
      />

      {/* Header */}
      <div className="relative mb-1 flex items-start justify-between gap-3">
        <p className="font-mono text-xs font-medium uppercase tracking-wider2 text-jade-700">
          Quick tip
        </p>
        <p className="text-right font-mono text-xs text-ink-dim">
          One-tap re-tip
        </p>
      </div>
      <h2 className="relative font-display text-2xl font-medium leading-snug text-ink md:text-3xl">
        Your <em className="italic text-jade-500">regulars.</em>
      </h2>

      {hasRegulars ? (
        <div className="relative mt-5 flex flex-col gap-3">
          {regulars.slice(0, 3).map((regular) => {
            const r = regular.recipient;
            return (
              <div
                key={r.name}
                className="rounded-2xl border border-line-soft bg-paper p-3.5 transition-shadow duration-200 hover:shadow-lift"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-display text-sm font-medium italic text-paper"
                    style={{ background: SWATCH_GRADIENTS[r.swatch] }}
                  >
                    {r.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{r.name}</p>
                    <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
                      {r.role} · {r.location} · {regular.defaultApp}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-1.5">
                  {regular.quickAmountsCents.map((cents) => {
                    const { sign, whole } = splitDollars(cents);
                    return (
                      <button
                        key={cents}
                        type="button"
                        className="flex-1 rounded-full border border-line bg-paper py-2 font-display text-base font-medium italic text-ink transition-all duration-150 hover:-translate-y-px hover:border-jade-300 hover:bg-jade-50 active:scale-95"
                      >
                        <span className="mr-0.5 font-mono text-[10px] font-medium not-italic text-jade-500">
                          {sign}
                        </span>
                        {whole}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            className="mt-1 rounded-full border border-dashed border-jade-300 bg-paper px-4 py-2.5 text-sm font-medium text-jade-700 transition-colors duration-200 hover:bg-jade-50"
          >
            Manage regulars →
          </button>
        </div>
      ) : (
        <div className="relative mt-5 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-jade-200 bg-paper px-4 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-jade-100">
            <Sparkles className="h-5 w-5 text-jade-500" strokeWidth={1.5} />
          </div>
          <p className="font-display text-lg font-medium italic text-ink">
            Your regulars will live here.
          </p>
          <p className="max-w-xs text-sm text-ink-dim">
            After you tip the same person a couple of times, we&rsquo;ll surface them here
            for one-tap re-tipping. Your barista, your stylist, your Friday-night bartender.
          </p>
        </div>
      )}
    </div>
  );
}
