'use client';

// Mapbox CSS is loaded statically so Next can route-split it — only ships
// in the chunk for the tipper dashboard, not site-wide.
import 'mapbox-gl/dist/mapbox-gl.css';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from '@/components/icons';
import type { MapPin as Pin } from '@/lib/dashboard/tipper-data';
import { splitDollars } from '@/lib/dashboard/placeholder-data';

interface AppreciationMapProps {
  pins: Pin[];
}

/**
 * Token visibility — NEXT_PUBLIC_ vars are inlined at build time.
 * If absent at build, this evaluates to undefined and we fall back to the
 * styled placeholder (same as the pre-Mapbox version) without crashing.
 */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/**
 * Compute the centroid + bounds of a pin set in one pass.
 * Returns [centerLng, centerLat] + a bbox tuple for fitBounds.
 */
function computeBounds(pins: Pin[]): {
  center: [number, number];
  bbox: [[number, number], [number, number]];
} {
  let minLng = pins[0]!.lng, maxLng = pins[0]!.lng;
  let minLat = pins[0]!.lat, maxLat = pins[0]!.lat;
  let sumLng = 0, sumLat = 0;
  for (const p of pins) {
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    sumLng += p.lng;
    sumLat += p.lat;
  }
  return {
    center: [sumLng / pins.length, sumLat / pins.length],
    bbox: [[minLng, minLat], [maxLng, maxLat]],
  };
}

/**
 * AppreciationMap — physical-world heatmap of where the tipper has tipped.
 *
 * Mapbox GL JS is loaded lazily on mount (separate chunk). Custom coral
 * markers sized by tipCount; brand-styled popups; light-v11 base style
 * for the off-white aesthetic that matches our paper background.
 *
 * Fallback paths:
 *   - No pins → empty state with a "fills in as you tip" message
 *   - No NEXT_PUBLIC_MAPBOX_TOKEN at build → styled placeholder grid
 *   - Mapbox import/runtime fails → styled placeholder grid
 *
 * The city breakdown list renders unconditionally — useful even when the
 * live map is unavailable.
 */
export function AppreciationMap({ pins }: AppreciationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // Capture pins in a ref so the init effect can read them WITHOUT depending
  // on them as a dep. Parent re-renders create new pins array references on
  // every render; depending on `pins` would tear down + recreate the map
  // each time, sometimes interrupting tile fetches mid-flight.
  const pinsRef = useRef<Pin[]>(pins);
  pinsRef.current = pins;

  const [mapError, setMapError] = useState(false);

  const hasPins = pins.length > 0;
  const hasToken = Boolean(MAPBOX_TOKEN);
  const useRealMap = hasPins && hasToken && !mapError;

  // City aggregation for the side legend — independent of map availability
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

  // -- Mapbox setup -------------------------------------------------------
  useEffect(() => {
    if (!useRealMap || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    (async () => {
      try {
        const mbgl = await import('mapbox-gl');
        if (cancelled || !mapContainerRef.current) return;

        const mapboxgl = mbgl.default;
        mapboxgl.accessToken = MAPBOX_TOKEN as string;

        // Read pins from the ref so this effect doesn't need pins as a dep
        const currentPins = pinsRef.current;
        const { center, bbox } = computeBounds(currentPins);
        const maxTipCount = Math.max(...currentPins.map((p) => p.tipCount), 1);

        // Diagnostic — let me see what the container measures as at this moment
        const rect0 = mapContainerRef.current.getBoundingClientRect();
        console.log('[AppreciationMap] container at init:', rect0.width, 'x', rect0.height);

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center,
          zoom: 3,
          attributionControl: false,
          dragRotate: false,
          touchPitch: false,
          pitchWithRotate: false,
        });

        // Diagnostic — verify canvas dimensions match container
        const canvas0 = map.getCanvas();
        console.log('[AppreciationMap] canvas at create:', canvas0?.width, 'x', canvas0?.height);

        // -- AGGRESSIVE RESIZE TIMING ---------------------------------
        // Throw enough resize() calls that any "container 0x0 at this moment"
        // timing window gets caught. RAF fires after the next paint when
        // layout has definitely settled. Timeouts cover late-arriving
        // reflows (web fonts loading, image dimensions resolving, etc.)
        map.resize();
        requestAnimationFrame(() => {
          if (!cancelled && mapInstanceRef.current) {
            map.resize();
            const rect1 = mapContainerRef.current?.getBoundingClientRect();
            console.log('[AppreciationMap] container after RAF:', rect1?.width, 'x', rect1?.height);
          }
        });
        setTimeout(() => {
          if (!cancelled && mapInstanceRef.current) {
            map.resize();
            const canvas1 = map.getCanvas();
            console.log('[AppreciationMap] canvas at 100ms:', canvas1?.width, 'x', canvas1?.height);
          }
        }, 100);
        setTimeout(() => {
          if (!cancelled && mapInstanceRef.current) {
            map.resize();
            console.log('[AppreciationMap] resize at 500ms; loaded:', map.loaded());
          }
        }, 500);

        // Compact attribution in bottom-right — required by Mapbox terms
        map.addControl(
          new mapboxgl.AttributionControl({ compact: true }),
          'bottom-right',
        );

        // Standard zoom in/out — top-right
        map.addControl(
          new mapboxgl.NavigationControl({ showCompass: false, visualizePitch: false }),
          'top-right',
        );

        // Diagnostic event listeners — tell us EXACTLY where it dies if it does
        map.on('styledata', () => console.log('[AppreciationMap] styledata fired'));
        map.on('sourcedataloading', (e) => console.log('[AppreciationMap] source loading:', e.sourceId));
        map.on('sourcedata', (e) => {
          if (e.isSourceLoaded) console.log('[AppreciationMap] source loaded:', e.sourceId);
        });
        map.on('idle', () => console.log('[AppreciationMap] map idle (tiles loaded)'));

        map.on('load', () => {
          if (cancelled) return;

          map.resize();
          const canvas2 = map.getCanvas();
          console.log('[AppreciationMap] on load → canvas:', canvas2?.width, 'x', canvas2?.height);
          console.log('[AppreciationMap] on load → zoom:', map.getZoom(), 'center:', map.getCenter());

          map.fitBounds(bbox, { padding: 60, maxZoom: 11, duration: 0 });

          // Render each pin as a custom DOM marker, sized by tipCount.
          currentPins.forEach((pin) => {
            const sizePx = Math.max(
              14,
              Math.min(40, Math.round((pin.tipCount / maxTipCount) * 28) + 14),
            );

            const el = document.createElement('div');
            el.style.width = `${sizePx}px`;
            el.style.height = `${sizePx}px`;
            el.style.borderRadius = '50%';
            el.style.background = '#F06844';
            el.style.boxShadow =
              '0 0 0 4px rgba(240, 104, 68, 0.20), 0 2px 8px rgba(14, 20, 32, 0.18)';
            el.style.border = '2px solid #FBF7F1';
            el.style.cursor = 'pointer';
            el.style.transition = 'transform 0.15s ease';
            el.addEventListener('mouseenter', () => {
              el.style.transform = 'scale(1.12)';
            });
            el.addEventListener('mouseleave', () => {
              el.style.transform = 'scale(1)';
            });

            const { sign, whole } = splitDollars(pin.totalCents);
            const popupHTML = `
              <div style="font-family: 'Geist', system-ui, sans-serif; padding: 4px 2px; min-width: 140px;">
                <div style="font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: 16px; font-weight: 500; color: #0E1420; line-height: 1.2;">
                  ${escapeHTML(pin.location)}
                </div>
                <div style="font-family: 'Geist Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A94A7; margin-top: 4px;">
                  ${escapeHTML(pin.city)}
                </div>
                <div style="margin-top: 10px; display: flex; gap: 10px; align-items: baseline; padding-top: 8px; border-top: 1px solid #EDE8DE;">
                  <span style="font-family: 'Fraunces', Georgia, serif; font-style: italic; font-size: 20px; font-weight: 500; color: #0E1420; line-height: 1;">
                    <span style="font-family: 'Geist Mono', monospace; font-style: normal; font-size: 11px; color: #2C6F57; margin-right: 1px;">${sign}</span>${whole}
                  </span>
                  <span style="font-family: 'Geist Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #8A94A7;">
                    ${pin.tipCount} ${pin.tipCount === 1 ? 'tip' : 'tips'}
                  </span>
                </div>
              </div>
            `;

            const popup = new mapboxgl.Popup({
              offset: Math.ceil(sizePx / 2) + 6,
              closeButton: false,
              closeOnClick: true,
              maxWidth: '240px',
            }).setHTML(popupHTML);

            new mapboxgl.Marker(el)
              .setLngLat([pin.lng, pin.lat])
              .setPopup(popup)
              .addTo(map);
          });
        });

        map.on('error', (e) => {
          console.error('[AppreciationMap] map error:', e);
          setMapError(true);
        });

        // Watch the container for size changes — handles window resize,
        // dashboard panel reflow, mobile orientation, etc.
        if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
          resizeObserver = new ResizeObserver(() => {
            if (mapInstanceRef.current) mapInstanceRef.current.resize();
          });
          resizeObserver.observe(mapContainerRef.current);
        }

        mapInstanceRef.current = map;
      } catch (err) {
        console.warn('Mapbox failed to initialize, falling back to placeholder', err);
        setMapError(true);
      }
    })();

    return () => {
      cancelled = true;
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [useRealMap]);

  // -- RENDER -------------------------------------------------------------

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
          {/* Map panel — real Mapbox when token + lib available, styled placeholder otherwise */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-jade-100">
            {useRealMap ? (
              <div ref={mapContainerRef} className="absolute inset-0" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-jade-50 via-paper to-coral-50">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.08]"
                  style={{
                    backgroundImage:
                      'linear-gradient(0deg, #0E1420 1px, transparent 1px), linear-gradient(90deg, #0E1420 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                />
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
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full border border-jade-300 bg-paper/90 px-4 py-2 font-mono text-[10px] uppercase tracking-wider2 text-jade-700 backdrop-blur-sm">
                    {hasToken ? 'Map loading\u2026' : 'Live map \u00b7 Mapbox key pending'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* City breakdown legend — renders with or without live map */}
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

/**
 * Minimal HTML escape for popup interpolation — defense-in-depth in case a
 * location name ever contains user-controlled text.
 */
function escapeHTML(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
