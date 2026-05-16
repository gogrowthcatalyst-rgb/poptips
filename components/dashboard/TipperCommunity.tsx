'use client';

import { useState } from 'react';
import type { Recipient, TipperLeaderboardEntry } from '@/lib/dashboard/tipper-data';
import { splitDollars } from '@/lib/dashboard/placeholder-data';

const SWATCH_GRADIENTS = {
  coral:        'linear-gradient(135deg, #F06844, #FFA587)',
  jade:         'linear-gradient(135deg, #2C6F57, #6BA589)',
  gold:         'linear-gradient(135deg, #E9A21C, #FFEBC2)',
  violet:       'linear-gradient(135deg, #6B5BFF, #B5AEFF)',
  'coral-dark': 'linear-gradient(135deg, #C44A2C, #F06844)',
} as const;

// -- TOP RECIPIENTS (workers you've appreciated most) -------------------

export function TopRecipients({ recipients }: { recipients: Recipient[] }) {
  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-line-soft bg-paper p-6 shadow-lift md:p-7">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="font-display text-xl font-medium leading-snug text-ink md:text-2xl">
          Workers you&rsquo;ve <em className="italic text-coral-500">appreciated most.</em>
        </h3>
        <button
          type="button"
          className="font-mono text-[11px] uppercase tracking-wider2 text-ink-dim transition-colors hover:text-ink"
        >
          See all →
        </button>
      </div>

      {recipients.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-center">
          <p className="max-w-xs text-sm italic text-ink-faint">
            After a few tips, your most-supported workers will live here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {recipients.map((r, i) => {
            const { sign, whole } = splitDollars(r.totalCents);
            return (
              <li key={i}>
                <div className="grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-coral-50">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full font-display text-sm font-medium italic text-paper"
                    style={{ background: SWATCH_GRADIENTS[r.swatch] }}
                  >
                    {r.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{r.name}</p>
                    <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
                      {r.role} · {r.location} · {r.tipCount} tips · {r.lastTipLabel}
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

// -- TIPPER LEADERBOARD (opt-in anonymous) ------------------------------

const TIPPER_TABS = ['Your age group', 'Your city', 'Generosity', 'Repeat tipper'] as const;

/**
 * Tipper leaderboard — Pete locked opt-in anonymous default.
 *
 * Every row shows as "Tipper" unless the user has opted in to reveal their
 * real first name on the leaderboard. The user's own row shows their own
 * name to them (since they always know who they are), but the meta line
 * notes how others see them.
 *
 * Privacy disclaimer in the header makes the opt-in model visible.
 */
export function TipperLeaderboard({ entries, isOptedIn = false }: {
  entries: TipperLeaderboardEntry[];
  isOptedIn?: boolean;
}) {
  const [tab, setTab] = useState<(typeof TIPPER_TABS)[number]>('Your age group');

  const topFive = entries.filter((e) => !e.isYou).slice(0, 5);
  const you = entries.find((e) => e.isYou);

  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-line-soft bg-paper p-6 shadow-lift md:p-7">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-medium leading-snug text-ink md:text-2xl">
          Generosity <em className="italic text-jade-500">leaderboard.</em>
        </h3>
        <button
          type="button"
          className="font-mono text-[11px] uppercase tracking-wider2 text-ink-dim transition-colors hover:text-ink"
        >
          {isOptedIn ? 'Settings' : 'Opt in →'}
        </button>
      </div>

      {/* Privacy notice */}
      <p className="mb-3 rounded-lg border border-jade-100 bg-jade-50/50 px-3 py-2 text-[11px] leading-relaxed text-ink-dim">
        Leaderboard is <strong className="font-medium text-ink">anonymous by default.</strong>{' '}
        Other tippers see you as &ldquo;Tipper&rdquo; — only your first name appears if you opt in.
      </p>

      {/* Tab pills */}
      <div className="mb-4 flex flex-wrap gap-1.5 font-mono text-[10px] font-medium uppercase tracking-wider2">
        {TIPPER_TABS.map((t) => (
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
        <div className="flex h-40 items-center justify-center text-center">
          <p className="max-w-xs text-sm italic text-ink-faint">
            Once you start tipping, you&rsquo;ll see how your generosity ranks in {tab.toLowerCase()}.
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
                    <p className="text-sm font-medium text-ink">
                      {entry.displayName}
                      {entry.optedInToReveal && (
                        <span className="ml-1.5 align-middle font-mono text-[9px] uppercase tracking-wider2 text-jade-700">
                          · revealed
                        </span>
                      )}
                    </p>
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

          {/* "You" row */}
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
                    <p className="text-sm font-medium text-ink">
                      {you.displayName}
                      {!isOptedIn && (
                        <span className="ml-1.5 align-middle font-mono text-[9px] uppercase tracking-wider2 text-ink-faint">
                          · others see you as &ldquo;Tipper&rdquo;
                        </span>
                      )}
                    </p>
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
