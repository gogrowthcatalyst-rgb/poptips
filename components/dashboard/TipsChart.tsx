'use client';

import { useState } from 'react';
import type { ChartSeries } from '@/lib/dashboard/placeholder-data';
import { formatDollars } from '@/lib/dashboard/placeholder-data';

interface TipsChartProps {
  series: ChartSeries;
}

const PERIODS = ['Week', '30 Days', 'Quarter', 'Year'] as const;
type Period = (typeof PERIODS)[number];

/**
 * Tips over time — area chart with gradient fill.
 *
 * Period tabs are visual for now; only "30 Days" has placeholder data
 * attached. When the DB lands, each period will query a different time
 * window and re-render.
 */
export function TipsChart({ series }: TipsChartProps) {
  const [period, setPeriod] = useState<Period>('30 Days');
  const hasData = series.length > 0;

  // Chart geometry
  const W = 800;
  const H = 280;
  const PAD_L = 50;
  const PAD_R = 30;
  const PAD_T = 30;
  const PAD_B = 40;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const max = hasData ? Math.max(...series.map((s) => s.cents)) : 100;
  // Round max up to nearest "nice" boundary for axis labels
  const niceMax = Math.ceil(max / 1000) * 1000;

  const points = hasData
    ? series.map((s, i) => {
        const x = PAD_L + (i / Math.max(series.length - 1, 1)) * plotW;
        const y = PAD_T + plotH - (s.cents / niceMax) * plotH;
        return [x, y, s];
      })
    : [];

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const fillPath = hasData
    ? linePath + ` L ${PAD_L + plotW} ${PAD_T + plotH} L ${PAD_L} ${PAD_T + plotH} Z`
    : '';

  // Y-axis tick values
  const yTicks = [niceMax, niceMax * 0.75, niceMax * 0.5, niceMax * 0.25, 0];
  // X-axis ticks — every ~7 days
  const xTicks = hasData
    ? [
        series[0]!,
        series[Math.floor(series.length / 4)]!,
        series[Math.floor(series.length / 2)]!,
        series[Math.floor((series.length * 3) / 4)]!,
        series[series.length - 1]!,
      ]
    : [];

  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-line-soft bg-paper p-6 shadow-lift md:p-8">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
            Tips over time
          </p>
          <h3 className="font-display text-2xl font-medium leading-tight text-ink md:text-3xl">
            Your <em className="italic text-jade-500">trend.</em>
          </h3>
        </div>
        <div className="inline-flex rounded-full border border-line bg-paper p-1 font-mono text-[10px] font-medium uppercase tracking-wider2">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1.5 transition-colors duration-200 ${
                period === p
                  ? 'bg-ink text-paper'
                  : 'text-ink-dim hover:text-ink'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {hasData ? (
        <>
          <div className="relative h-[280px] w-full">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="chartfill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2C6F57" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2C6F57" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {yTicks.slice(0, -1).map((v, i) => {
                const y = PAD_T + (i / 4) * plotH;
                return (
                  <line
                    key={i}
                    x1={PAD_L}
                    y1={y}
                    x2={PAD_L + plotW}
                    y2={y}
                    stroke="#EDE8DE"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Y-axis labels */}
              {yTicks.map((v, i) => {
                const y = PAD_T + (i / (yTicks.length - 1)) * plotH;
                return (
                  <text
                    key={i}
                    x={PAD_L - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontFamily="Geist Mono, monospace"
                    fontSize="11"
                    fill="#8A94A7"
                  >
                    {formatDollars(v, { compact: true })}
                  </text>
                );
              })}

              {/* Area fill */}
              <path d={fillPath} fill="url(#chartfill)" />

              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#2C6F57"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data dots on the last 4 points to suggest recent activity */}
              {points.slice(-4).map(([x, y], i) => (
                <circle key={i} cx={Number(x)} cy={Number(y)} r="4" fill="#2C6F57" />
              ))}

              {/* X-axis labels */}
              {xTicks.map((t, i) => {
                const x = PAD_L + (i / (xTicks.length - 1)) * plotW;
                return (
                  <text
                    key={i}
                    x={x}
                    y={H - PAD_B + 22}
                    textAnchor="middle"
                    fontFamily="Geist Mono, monospace"
                    fontSize="11"
                    fill="#8A94A7"
                  >
                    {t.day}
                  </text>
                );
              })}
            </svg>
          </div>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
            Period: {period} · placeholder data
          </p>
        </>
      ) : (
        <div className="flex h-[280px] flex-col items-center justify-center text-center">
          <p className="font-display text-xl font-medium italic text-ink-dim md:text-2xl">
            Your chart fills in as tips arrive.
          </p>
          <p className="mt-2 max-w-xs text-sm text-ink-faint">
            One tip is enough to start — the line builds itself from there.
          </p>
        </div>
      )}
    </div>
  );
}
