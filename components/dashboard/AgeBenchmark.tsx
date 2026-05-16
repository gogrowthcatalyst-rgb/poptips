'use client';

import type { AgeBenchmark as Benchmark } from '@/lib/dashboard/tipper-data';
import { Sparkles } from '@/components/icons';

export function AgeBenchmark({ data }: { data: Benchmark }) {
  const { ageGroup, groupAvgMonthly, yourMonthly, yourPercentile, bins, yourBin, hasAge } = data;
  const hasUserData = yourMonthly > 0;

  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-coral-100 bg-gradient-to-br from-coral-50 via-paper to-paper p-6 shadow-lift">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-coral-100 opacity-50 blur-2xl"
      />
      <div className="relative">
        <p className="mb-1 font-mono text-xs font-medium uppercase tracking-wider2 text-coral-700">
          Tippers your age
        </p>
        <h3 className="font-display text-xl font-medium leading-snug text-ink md:text-2xl">
          Age group <em className="italic text-coral-500">{hasAge ? ageGroup : 'all tippers'}</em>
        </h3>

        {/* Histogram */}
        <div className="mt-5 flex h-20 items-end gap-1">
          {bins.map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-sm transition-all duration-300 ${
                i === yourBin && hasUserData
                  ? 'bg-coral-500 shadow-[0_0_0_4px_rgba(240,104,68,0.15)]'
                  : 'bg-coral-300 opacity-60'
              }`}
              style={{ height: `${Math.max(h, 4)}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
          <span>$10</span>
          <span>${(groupAvgMonthly / 100).toFixed(0)} avg/mo</span>
          <span>$200+</span>
        </div>

        {/* Stat trio */}
        <div className="mt-5 flex gap-3 border-t border-line-soft pt-4">
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
              Group avg
            </p>
            <p className="mt-1 font-display text-lg font-medium italic text-ink">
              <span className="mr-0.5 font-mono text-xs font-medium not-italic text-coral-500">$</span>
              {(groupAvgMonthly / 100).toFixed(2)}
              <span className="ml-1 font-mono text-xs font-medium not-italic text-ink-faint">/mo</span>
            </p>
          </div>
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
              Your monthly
            </p>
            <p className={`mt-1 font-display text-lg font-medium italic ${hasUserData ? 'text-coral-500' : 'text-ink-faint'}`}>
              <span className="mr-0.5 font-mono text-xs font-medium not-italic text-coral-500">$</span>
              {hasUserData ? (yourMonthly / 100).toFixed(2) : '—'}
            </p>
          </div>
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
              Your rank
            </p>
            <p className={`mt-1 font-display text-lg font-medium italic ${hasUserData ? 'text-coral-500' : 'text-ink-faint'}`}>
              {hasUserData ? `Top ${yourPercentile}%` : '—'}
            </p>
          </div>
        </div>

        {/* Share-age CTA when age is missing */}
        {!hasAge && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-coral-100 bg-paper px-3 py-3">
            <Sparkles className="h-4 w-4 flex-shrink-0 text-coral-500" strokeWidth={1.5} />
            <div className="flex-1">
              <p className="text-xs leading-relaxed text-ink-dim">
                Share your age to see how you compare with tippers in your age group. Optional, always private.
              </p>
              <button
                type="button"
                className="mt-1.5 font-mono text-[10px] font-medium uppercase tracking-wider2 text-coral-700 transition-colors hover:text-coral-500"
              >
                Add age →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
