'use client';

import type { ChartSeries, MiniBarSeries } from '@/lib/dashboard/placeholder-data';
import { splitDollars } from '@/lib/dashboard/placeholder-data';

/** Common shell wrapping the colored decorative card */
function StatShell({
  tone,
  children,
}: {
  tone: 'jade' | 'gold' | 'coral';
  children: React.ReactNode;
}) {
  const toneClasses = {
    jade:  'border-jade-100 bg-gradient-to-br from-jade-50 via-paper to-paper',
    gold:  'border-gold-500/25 bg-gradient-to-br from-gold-100/50 via-paper to-paper',
    coral: 'border-coral-100 bg-gradient-to-br from-coral-50 via-paper to-paper',
  };
  const orbClasses = {
    jade:  'bg-jade-100',
    gold:  'bg-gold-100 opacity-60',
    coral: 'bg-coral-100',
  };
  return (
    <div className={`relative h-full overflow-hidden rounded-3xl border p-7 shadow-lift ${toneClasses[tone]}`}>
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-50 blur-2xl ${orbClasses[tone]}`}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/** Eyebrow text — colored per tone */
function Eyebrow({ tone, children }: { tone: 'jade' | 'gold' | 'coral'; children: React.ReactNode }) {
  const toneClass = {
    jade:  'text-jade-700',
    gold:  'text-gold-700',
    coral: 'text-coral-700',
  };
  return (
    <p className={`mb-3 font-mono text-xs font-medium uppercase tracking-wider2 ${toneClass[tone]}`}>
      {children}
    </p>
  );
}

/** Big italic Fraunces money display with mono $ superscript */
function StatAmount({ cents, tone }: { cents: number; tone: 'jade' | 'gold' | 'coral' }) {
  const { sign, whole, decimal } = splitDollars(cents);
  const signTone = {
    jade:  'text-jade-500',
    gold:  'text-gold-500',
    coral: 'text-coral-500',
  };
  return (
    <span className="inline-flex items-baseline">
      <span
        className={`mr-1 translate-y-[0.4em] self-start font-mono text-2xl font-medium leading-none ${signTone[tone]}`}
      >
        {sign}
      </span>
      <span className="font-display text-6xl font-medium italic leading-none tracking-tightest text-ink md:text-7xl">
        {whole}
      </span>
      {decimal !== null && (
        <span className="ml-1 font-display text-2xl font-medium italic leading-none text-ink-dim">
          .{decimal}
        </span>
      )}
    </span>
  );
}

/** Sparkline — last 30 days gradient + line */
function Sparkline({ series }: { series: ChartSeries }) {
  if (series.length === 0) {
    return <div className="h-9" aria-hidden />;
  }
  const max = Math.max(...series.map((s) => s.cents), 1);
  const w = 200;
  const h = 36;
  const points = series.map((s, i) => {
    const x = (i / Math.max(series.length - 1, 1)) * w;
    const y = h - (s.cents / max) * (h - 4) - 2;
    return [x, y];
  });
  const pathLine = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const pathFill = pathLine + ` L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-9 w-full">
      <defs>
        <linearGradient id="sparkfill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2C6F57" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2C6F57" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={pathFill} fill="url(#sparkfill)" />
      <path d={pathLine} fill="none" stroke="#2C6F57" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Mini bar chart — 8 weekly bars */
function MiniBars({ heights }: { heights: MiniBarSeries }) {
  return (
    <div className="grid h-9 grid-cols-8 items-end gap-1">
      {heights.map((h, i) => (
        <div
          key={i}
          className="rounded-sm bg-gold-500 opacity-80"
          style={{ height: `${Math.max(h, 4)}%` }}
        />
      ))}
    </div>
  );
}

/** Streak weeks — 14 vertical bars, dimmed for empty weeks */
function StreakBars({ weeks, total = 14 }: { weeks: number; total?: number }) {
  return (
    <div className="flex h-9 items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-9 flex-1 rounded ${i < weeks ? 'bg-coral-500' : 'bg-coral-500/15'}`}
        />
      ))}
    </div>
  );
}

// -- THE THREE CARDS -----------------------------------------------------

export function LifetimeCard({
  amountCents,
  tipCount,
  sinceISO,
  sparkline,
}: {
  amountCents: number;
  tipCount: number;
  sinceISO: string;
  sparkline: ChartSeries;
}) {
  const hasData = amountCents > 0;
  const sinceLabel = sinceISO
    ? new Date(sinceISO + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '';
  return (
    <StatShell tone="jade">
      <Eyebrow tone="jade">Lifetime received</Eyebrow>
      <StatAmount cents={amountCents} tone="jade" />
      <p className="mt-2 text-sm text-ink-dim">
        {hasData ? (
          <>
            Across <strong className="font-mono font-semibold text-jade-500">{tipCount} tips</strong>
            {sinceLabel && <> · since {sinceLabel}</>}
          </>
        ) : (
          <>Your first tip will live here.</>
        )}
      </p>
      <div className="mt-4">
        <Sparkline series={sparkline} />
      </div>
    </StatShell>
  );
}

export function ThisMonthCard({
  amountCents,
  tipCount,
  percentVsLastMonth,
  bars,
}: {
  amountCents: number;
  tipCount: number;
  percentVsLastMonth: number;
  bars: MiniBarSeries;
}) {
  const hasData = amountCents > 0;
  const direction = percentVsLastMonth > 0 ? '↑' : percentVsLastMonth < 0 ? '↓' : '·';
  return (
    <StatShell tone="gold">
      <Eyebrow tone="gold">This month</Eyebrow>
      <StatAmount cents={amountCents} tone="gold" />
      <p className="mt-2 text-sm text-ink-dim">
        {hasData ? (
          <>
            {tipCount} tips ·{' '}
            <span className="font-medium text-jade-500">
              {direction} {Math.abs(percentVsLastMonth)}%
            </span>{' '}
            vs last month
          </>
        ) : (
          <>Weekly trend graph appears with tips.</>
        )}
      </p>
      <div className="mt-4">
        <MiniBars heights={bars} />
      </div>
    </StatShell>
  );
}

export function StreakCard({
  weeks,
  sinceLabel,
}: {
  weeks: number;
  sinceLabel: string;
}) {
  const hasData = weeks > 0;
  return (
    <StatShell tone="coral">
      <Eyebrow tone="coral">🔥 Streak</Eyebrow>
      <span className="inline-flex items-baseline">
        <span className="font-display text-6xl font-medium italic leading-none tracking-tightest text-ink md:text-7xl">
          {weeks}
        </span>
        <span className="ml-2 font-mono text-base font-medium text-coral-700">
          {weeks === 1 ? 'wk' : 'wks'}
        </span>
      </span>
      <p className="mt-2 text-sm text-ink-dim">
        {hasData
          ? `Tipped every week since ${sinceLabel}.`
          : 'Start your streak this week.'}
      </p>
      <div className="mt-4">
        <StreakBars weeks={weeks} />
      </div>
    </StatShell>
  );
}
