'use client';

import { useState } from 'react';
import type { Appreciator, LeaderboardEntry } from '@/lib/dashboard/placeholder-data';
import { splitDollars } from '@/lib/dashboard/placeholder-data';

const SWATCH_GRADIENTS = {
  coral:        'linear-gradient(135deg, #F06844, #FFA587)',
  jade:         'linear-gradient(135deg, #2C6F57, #6BA589)',
  gold:         'linear-gradient(135deg, #E9A21C, #FFEBC2)',
  violet:       'linear-gradient(135deg, #6B5BFF, #B5AEFF)',
  'coral-dark': 'linear-gradient(135deg, #C44A2C, #F06844)',
} as const;

// -- TOP APPRECIATORS ----------------------------------------------------

export function TopAppreciators({ appreciators }: { appreciators: Appreciator[] }) {
  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-line-soft bg-paper p-6 shadow-lift md:p-7">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="font-display text-xl font-medium leading-snug text-ink md:text-2xl">
          Your top <em className="italic text-coral-500">appreciators.</em>
        </h3>
        <button
          type="button"
          className="font-mono text-[11px] uppercase tracking-wider2 text-ink-dim transition-colors hover:text-ink"
        >
          See all →
        </button>
      </div>

      {appreciators.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-center">
          <p className="max-w-xs text-sm italic text-ink-faint">
            When you get tips, your most-loyal supporters will live here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {appreciators.map((a, i) => {
            const { sign, whole } = splitDollars(a.totalCents);
            return (
              <li key={i}>
                <div className="grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-coral-50">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-medium italic text-paper"
                    style={{ background: SWATCH_GRADIENTS[a.swatch] }}
                  >
                    {a.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{a.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
                      {a.tipCount} tips · {a.lastTipLabel}
                    </p>
                  </div>
                  <p className="text-right font-display text-lg font-medium italic text-ink">
                    <span className="mr-0.5 font-mono text-xs font-medium not-italic text-coral-500">
                      {sign}
                    </span>
                    {whole}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// -- LEADERBOARD ---------------------------------------------------------

const TABS = ['Your category', 'Your salon', 'All categories', 'By city'] as const;

export function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Your category');

  // Currently the placeholder returns the same data for all tabs;
  // when DB lands, the tab will drive the query.
  const topFive = entries.filter((e) => !e.isYou).slice(0, 5);
  const you = entries.find((e) => e.isYou);

  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-line-soft bg-paper p-6 shadow-lift md:p-7">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-medium leading-snug text-ink md:text-2xl">
          Leaderboard <em className="italic text-jade-500">— this month.</em>
        </h3>
        <button
          type="button"
          className="font-mono text-[11px] uppercase tracking-wider2 text-ink-dim transition-colors hover:text-ink"
        >
          All time →
        </button>
      </div>

      {/* Tab pills */}
      <div className="mb-4 flex flex-wrap gap-1.5 font-mono text-[10px] font-medium uppercase tracking-wider2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full border px-3 py-1.5 transition-all duration-150 ${
              tab === t
                ? 'border-ink bg-ink text-paper'
                : 'border-line bg-paper text-ink-dim hover:border-jade-300 hover:bg-jade-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-center">
          <p className="max-w-xs text-sm italic text-ink-faint">
            Once your tips start, you&rsquo;ll see how you rank across the {tab.toLowerCase()}.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {topFive.map((entry) => {
            const { sign, whole } = splitDollars(entry.amountCents);
            return (
              <li key={entry.rank}>
                <div className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-xl px-3 py-2.5">
                  <span
                    className={`text-center font-mono font-semibold ${
                      entry.medal ? 'text-lg' : 'text-sm'
                    } text-ink-faint`}
                  >
                    {entry.medal ?? entry.rank.toString().padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{entry.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
                      {entry.meta}
                    </p>
                  </div>
                  <p className="text-right font-display text-lg font-medium italic text-ink">
                    <span className="mr-0.5 font-mono text-xs font-medium not-italic text-ink-faint">
                      {sign}
                    </span>
                    {whole}
                  </p>
                </div>
              </li>
            );
          })}

          {/* "You" row, separated by a divider */}
          {you && (
            <>
              <li className="my-2 flex items-center justify-center border-t border-dashed border-line py-1">
                <span className="bg-paper px-3 font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
                  · · ·
                </span>
              </li>
              <li>
                <div className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-xl border border-jade-100 bg-gradient-to-br from-jade-50 to-paper px-3 py-2.5">
                  <span className="text-center font-mono text-sm font-semibold text-jade-700">
                    #{you.rank}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{you.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
                      {you.meta}
                    </p>
                  </div>
                  <p className="text-right font-display text-lg font-medium italic text-ink">
                    <span className="mr-0.5 font-mono text-xs font-medium not-italic text-jade-500">
                      {splitDollars(you.amountCents).sign}
                    </span>
                    {splitDollars(you.amountCents).whole}
                  </p>
                </div>
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
}
