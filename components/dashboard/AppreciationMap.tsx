'use client';

import { MapPin } from '@/components/icons';
import type { MapPin as Pin } from '@/lib/dashboard/tipper-data';
import { splitDollars } from '@/lib/dashboard/placeholder-data';

interface AppreciationMapProps {
  pins: Pin[];
}

/**
 * AppreciationMap — physical-world heatmap of where the tipper has sent
 * tips. Each pin is a location where they tipped at least once.
 *
 * Mapbox-style live map activates once NEXT_PUBLIC_MAPBOX_TOKEN is in
 * Vercel env. For now, renders a brand-styled placeholder showing the
 * pin data as a stylized location list — useful even without the live
 * map, and the visual treatment matches the other dashboard cards.
 *
 * Pete confirmed Mapbox account, ready to spin up. Once the token lands,
 * this component swaps in a real Mapbox GL JS view in a 16:9 box,
 * driven by the same `pins` prop. The list view below can stay as a
 * companion legend / quick-jump.
 */
export function AppreciationMap({ pins }: AppreciationMapProps) {
  const hasPins = pins.length > 0;

  // Group pins by city for a cleaner summary
  const byCity = pins.reduce<Record<string, { pins: Pin[]; totalCents: number; tipCount: number }>>(
    (acc, p) => {
      const key = p.city;
      if (!acc[key]) acc[key] = { pins: [], totalCents: 0, tipCount: 0 };
      acc[key].pins.push(p);
      acc[key].totalCents += p.totalCents;
      acc[key].tipCount += p.tipCount;
      return acc;
    },
    {},
  );

  const cities = Object.entries(byCity).sort(([, a], [, b]) => b.totalCents - a.totalCents);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line-soft bg-paper p-6 shadow-lift md:p-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
            Your appreciation map
          </p>
          <h3 className="font-display text-2xl font-medium leading-tight text-ink md:text-3xl">
            Where your tips <em className="italic text-jade-500">land.</em>
          </h3>
        </div>
        {hasPins && (
          <p className="font-mono text-[11px] uppercase tracking-wider2 text-ink-dim">
            <strong className="font-semibold text-ink">{pins.length}</strong> locations ·{' '}
            <strong className="font-semibold text-ink">{cities.length}</strong> cities
          </p>
        )}
      </div>

      {hasPins ? (
        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
          {/* Stylized "map" panel — placeholder for Mapbox */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-jade-100 bg-gradient-to-br from-jade-50 via-paper to-coral-50">
            {/* Decorative grid texture suggesting cartography */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  'linear-gradient(0deg, #0E1420 1px, transparent 1px), linear-gradient(90deg, #0E1420 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            {/* Scatter the pins across the placeholder visually — clustered to suggest density */}
            {pins.slice(0, 8).map((p, i) => {
              const xPct = 15 + ((i * 47) % 70);
              const yPct = 20 + ((i * 31) % 60);
              const sizePx = Math.max(8, Math.min(24, Math.round((p.tipCount / 18) * 24)));
              return (
                <div
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral-500 shadow-[0_0_0_4px_rgba(240,104,68,0.18)]"
                  style={{
                    left: `${xPct}%`,
                    top: `${yPct}%`,
                    width: `${sizePx}px`,
                    height: `${sizePx}px`,
                  }}
                  title={`${p.location} · ${p.tipCount} tips`}
                />
              );
            })}
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full border border-jade-300 bg-paper/90 px-4 py-2 font-mono text-[10px] uppercase tracking-wider2 text-jade-700 backdrop-blur-sm">
                Live map · Mapbox integration pending
              </div>
            </div>
          </div>

          {/* City breakdown list — drives the same data the live map will */}
          <div className="flex flex-col gap-2">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-wider2 text-ink-faint">
              Top cities
            </p>
            {cities.slice(0, 5).map(([city, agg]) => {
              const { sign, whole } = splitDollars(agg.totalCents);
              return (
                <div
                  key={city}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-line-soft bg-surface/50 px-3 py-2.5"
                >
                  <MapPin className="h-4 w-4 text-coral-500" strokeWidth={1.5} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{city}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
                      {agg.tipCount} tips · {agg.pins.length} {agg.pins.length === 1 ? 'spot' : 'spots'}
                    </p>
                  </div>
                  <p className="font-display text-base font-medium italic text-ink">
                    <span className="mr-0.5 font-mono text-[10px] font-medium not-italic text-jade-500">
                      {sign}
                    </span>
                    {whole}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-jade-100">
            <MapPin className="h-5 w-5 text-jade-500" strokeWidth={1.5} />
          </div>
          <p className="font-display text-xl font-medium italic text-ink-dim">
            Your map fills in as you tip.
          </p>
          <p className="max-w-md text-sm text-ink-faint">
            Every tip you send pins to the city where it happened — your morning coffee spot,
            your stylist&rsquo;s salon, that Uber ride home. A picture of where your
            appreciation has traveled.
          </p>
        </div>
      )}
    </div>
  );
}
