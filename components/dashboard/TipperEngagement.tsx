'use client';

import type { TipperAchievement, SentTip } from '@/lib/dashboard/tipper-data';
import { splitDollars } from '@/lib/dashboard/placeholder-data';

const SWATCH_GRADIENTS = {
  coral:        'linear-gradient(135deg, #F06844, #FFA587)',
  jade:         'linear-gradient(135deg, #2C6F57, #6BA589)',
  gold:         'linear-gradient(135deg, #E9A21C, #FFEBC2)',
  violet:       'linear-gradient(135deg, #6B5BFF, #B5AEFF)',
  'coral-dark': 'linear-gradient(135deg, #C44A2C, #F06844)',
} as const;

// -- TIPPER SHARE MILESTONE ---------------------------------------------

export function TipperShareMilestone({
  milestone,
  description,
}: {
  milestone: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink p-7 text-paper shadow-lift md:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-[20%] top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(233,162,28,0.3) 0%, transparent 60%)',
        }}
      />
      <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto] md:gap-8">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-wider2 text-gold-500">
            Milestone reached
          </p>
          <h3 className="mt-2 font-display text-3xl font-medium leading-tight tracking-tightest text-paper md:text-4xl">
            You&rsquo;ve <em className="italic text-gold-100">{milestone}.</em>
          </h3>
          <p className="mt-3 max-w-md text-base leading-relaxed text-ink-faint md:text-lg">
            {description}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 self-start whitespace-nowrap rounded-full bg-gold-500 px-7 py-3.5 text-base font-medium text-ink shadow-halo-gold transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-gold-100 active:scale-95 md:self-center"
        >
          Share to Stories <span aria-hidden>✦</span>
        </button>
      </div>
    </div>
  );
}

// -- TIPPER ACHIEVEMENTS -------------------------------------------------

export function TipperAchievements({ achievements }: { achievements: TipperAchievement[] }) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold-500/25 bg-gradient-to-br from-gold-100/40 via-paper to-paper p-7 shadow-lift md:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gold-100 opacity-50 blur-3xl"
      />
      <div className="relative">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h3 className="font-display text-2xl font-medium leading-tight text-ink md:text-3xl">
            Your <em className="italic text-gold-500">achievements.</em>
          </h3>
          <span className="font-mono text-[11px] uppercase tracking-wider2 text-gold-700">
            <strong className="font-semibold text-ink">{unlockedCount}</strong> of{' '}
            {achievements.length} unlocked
          </span>
        </div>

        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
        >
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`relative rounded-2xl border border-line-soft bg-paper p-4 text-center transition-transform duration-200 hover:-translate-y-0.5 ${
                a.unlocked ? '' : 'opacity-45'
              }`}
            >
              <div
                className={`mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-full font-mono text-sm font-semibold ${
                  a.unlocked
                    ? 'bg-gold-500 text-paper'
                    : 'bg-line-soft text-ink-faint'
                }`}
              >
                {a.glyph}
              </div>
              <p className="font-display text-sm font-medium italic text-ink">{a.name}</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-wider2 text-ink-faint">
                {a.condition}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -- RECENT SENT TIPS FEED -----------------------------------------------

export function RecentSentTips({ tips }: { tips: SentTip[] }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line-soft bg-paper p-6 shadow-lift md:p-8">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-medium leading-snug text-ink md:text-2xl">
          Recent <em className="italic text-jade-500">appreciation sent.</em>
        </h3>
        <button
          type="button"
          className="font-mono text-[11px] uppercase tracking-wider2 text-ink-dim transition-colors hover:text-ink"
        >
          Export CSV →
        </button>
      </div>

      {tips.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-jade-100">
            <span className="font-display text-xl italic text-jade-500">$</span>
          </div>
          <p className="font-display text-xl font-medium italic text-ink-dim">
            Your first tip starts the story.
          </p>
          <p className="max-w-md text-sm text-ink-faint">
            Every tip you send shows up in this list — who you appreciated, what app it went
            through, and the note you wrote them.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-line-soft">
          {tips.map((tip, i) => {
            const { sign, whole } = splitDollars(tip.amountCents);
            return (
              <li key={i}>
                <div className="grid grid-cols-[36px_1fr_auto_auto] items-center gap-3 px-1 py-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full font-display text-xs font-medium italic text-paper"
                    style={{ background: SWATCH_GRADIENTS[tip.swatch] }}
                  >
                    {tip.recipientInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {tip.recipientName}
                      <span className="ml-1.5 font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
                        · {tip.recipientRole}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
                      {tip.timeLabel}
                      {tip.note && (
                        <span className="ml-2 normal-case tracking-normal italic text-ink-dim">
                          · &ldquo;{tip.note}&rdquo;
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider2 text-ink-dim">
                    {tip.app}
                  </span>
                  <p className="font-display text-lg font-medium italic text-ink">
                    <span className="mr-0.5 font-mono text-xs font-medium not-italic text-jade-500">
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
