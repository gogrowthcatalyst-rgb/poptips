'use client';

import type {
  CategoryBenchmark as Benchmark,
  AppDistribution as Distribution,
  Heatmap,
} from '@/lib/dashboard/placeholder-data';
import { splitDollars } from '@/lib/dashboard/placeholder-data';

// -- CATEGORY BENCHMARK --------------------------------------------------

export function CategoryBenchmark({ data }: { data: Benchmark }) {
  const { category, averageCents, yourAverageCents, yourPercentile, bins, yourBin } = data;
  const hasUserData = yourAverageCents > 0;

  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-coral-100 bg-gradient-to-br from-coral-50 via-paper to-paper p-6 shadow-lift">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-coral-100 opacity-50 blur-2xl"
      />
      <div className="relative">
        <p className="mb-1 font-mono text-xs font-medium uppercase tracking-wider2 text-coral-700">
          Your category benchmark
        </p>
        <h3 className="font-display text-xl font-medium leading-snug text-ink md:text-2xl">
          {category} <em className="italic text-coral-500">(US average)</em>
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
          <span>$3</span>
          <span>${(averageCents / 100).toFixed(0)} avg</span>
          <span>$15+</span>
        </div>

        {/* Stat trio */}
        <div className="mt-5 flex gap-3 border-t border-line-soft pt-4">
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
              Category avg
            </p>
            <p className="mt-1 font-display text-lg font-medium italic text-ink">
              <span className="mr-0.5 font-mono text-xs font-medium not-italic text-coral-500">
                $
              </span>
              {(averageCents / 100).toFixed(2)}
            </p>
          </div>
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
              Your average
            </p>
            <p className={`mt-1 font-display text-lg font-medium italic ${hasUserData ? 'text-coral-500' : 'text-ink-faint'}`}>
              <span className="mr-0.5 font-mono text-xs font-medium not-italic text-coral-500">
                $
              </span>
              {hasUserData ? (yourAverageCents / 100).toFixed(2) : '—'}
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
      </div>
    </div>
  );
}

// -- APP DISTRIBUTION ----------------------------------------------------

const APP_COLORS = {
  venmo:   '#F06844', // coral
  cashapp: '#2C6F57', // jade
  paypal:  '#E9A21C', // gold
} as const;

export function AppDistribution({ data }: { data: Distribution }) {
  const { venmo, cashapp, paypal } = data;
  const total = venmo + cashapp + paypal;
  const hasData = total > 0;

  // Build donut segments
  const segments = [
    { key: 'venmo',   label: 'Venmo',    pct: venmo,   color: APP_COLORS.venmo },
    { key: 'cashapp', label: 'Cash App', pct: cashapp, color: APP_COLORS.cashapp },
    { key: 'paypal',  label: 'PayPal',   pct: paypal,  color: APP_COLORS.paypal },
  ];

  // Donut math
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-line-soft bg-paper p-6 shadow-lift">
      <p className="mb-1 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
        Tip sources · this month
      </p>
      <h3 className="font-display text-xl font-medium leading-snug text-ink md:text-2xl">
        By <em className="italic text-jade-500">payment app.</em>
      </h3>

      {hasData ? (
        <div className="mt-4 flex items-center gap-4">
          <svg viewBox="0 0 100 100" className="h-28 w-28 flex-shrink-0 -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#F4EEE4" strokeWidth="14" />
            {segments.map((s) => {
              const segLen = (s.pct / 100) * circumference;
              const offset = accumulatedOffset;
              accumulatedOffset += segLen;
              return (
                <circle
                  key={s.key}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="14"
                  strokeDasharray={`${segLen} ${circumference - segLen}`}
                  strokeDashoffset={-offset}
                />
              );
            })}
          </svg>
          <div className="grid w-full grid-cols-2 gap-2">
            {segments.map((s) => (
              <div key={s.key} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                  style={{ backgroundColor: s.color }}
                />
                <span className="flex-1 text-ink-dim">{s.label}</span>
                <span className="font-mono font-semibold text-ink">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 flex h-32 items-center justify-center text-center">
          <p className="text-sm italic text-ink-faint">
            Your app mix appears<br />once tips arrive.
          </p>
        </div>
      )}
    </div>
  );
}

// -- TIME HEATMAP --------------------------------------------------------

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['6a', '10a', '2p', '6p', '10p', '2a'];

export function TimeHeatmap({ data }: { data: Heatmap }) {
  const hasData = data.some((row) => row.some((v) => v > 0));

  // Map intensity 0–4 to jade tint
  const cellClass = (intensity: number) => {
    switch (intensity) {
      case 4:  return 'bg-jade-500';
      case 3:  return 'bg-jade-500/70';
      case 2:  return 'bg-jade-500/40';
      case 1:  return 'bg-jade-100';
      default: return 'bg-jade-50';
    }
  };

  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-line-soft bg-paper p-6 shadow-lift">
      <p className="mb-1 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
        When tips happen
      </p>
      <h3 className="font-display text-xl font-medium leading-snug text-ink md:text-2xl">
        Time-of-day <em className="italic text-jade-500">heatmap.</em>
      </h3>

      <div className="mt-4">
        <div className="grid gap-1" style={{ gridTemplateColumns: 'auto repeat(6, 1fr)' }}>
          {DAYS.map((day, dayIdx) => (
            <div key={day} className="contents">
              <span className="flex items-center pr-2 font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
                {day}
              </span>
              {(data[dayIdx] ?? [0, 0, 0, 0, 0, 0]).map((intensity, hourIdx) => (
                <div
                  key={hourIdx}
                  className={`aspect-[1.4/1] rounded ${cellClass(intensity)}`}
                  title={`${day} · ${HOURS[hourIdx]}`}
                />
              ))}
            </div>
          ))}
          {/* X-axis labels */}
          <div className="col-span-7 mt-2 grid" style={{ gridTemplateColumns: 'auto repeat(6, 1fr)' }}>
            <span />
            {HOURS.map((h) => (
              <span
                key={h}
                className="text-center font-mono text-[10px] uppercase tracking-wider2 text-ink-faint"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
        {!hasData && (
          <p className="mt-3 text-center text-xs italic text-ink-faint">
            Patterns emerge as tips accumulate.
          </p>
        )}
      </div>
    </div>
  );
}
