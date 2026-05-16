'use client';

import { Money } from './Money';

interface PopCircleProps {
  amount?: number;
  /** px width/height. Square. Defaults to 260. */
  size?: number;
  /**
   * 'brand' — coral rings + gold $. Decoupled from track accent.
   *   Use this for hero placements where the brand should sing
   *   regardless of which track the visitor is on.
   * 'track' — uses CSS vars (--accent etc), retints with the active
   *   track. For in-page placements that should adapt.
   */
  tone?: 'brand' | 'track';
  className?: string;
}

/**
 * The hero "pop" — concentric dashed circles, radiating accent lines,
 * a soft gradient halo, and a big italic Fraunces dollar amount overlaid.
 *
 * Default tone='brand' pins the colors to coral + gold so the hero
 * doesn't go monochrome on the neutral home page.
 */
export function PopCircle({
  amount = 20,
  size = 260,
  tone = 'brand',
  className,
}: PopCircleProps) {
  // Resolve colors based on tone
  const isBrand = tone === 'brand';
  const ringColor = isBrand ? '#F06844' : 'var(--accent)';
  const ringDimColor = isBrand ? '#FFA587' : 'var(--accent-glow)';
  const haloId = `popHalo-${tone}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center animate-pop-in ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      {/* Decorative SVG layer — sits behind the amount */}
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full animate-drift-slow"
        aria-hidden
      >
        <defs>
          <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={ringColor} stopOpacity="0.22" />
            <stop offset="55%" stopColor={ringColor} stopOpacity="0.06" />
            <stop offset="100%" stopColor={ringColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft halo */}
        <circle cx="200" cy="200" r="190" fill={`url(#${haloId})`} />

        {/* Outer dashed ring */}
        <circle
          cx="200"
          cy="200"
          r="160"
          fill="none"
          stroke={ringColor}
          strokeOpacity="0.28"
          strokeDasharray="2 8"
          strokeWidth="1.5"
        />

        {/* Mid dashed ring */}
        <circle
          cx="200"
          cy="200"
          r="120"
          fill="none"
          stroke={ringColor}
          strokeOpacity="0.4"
          strokeDasharray="1 5"
          strokeWidth="1.5"
        />

        {/* Inner subtle ring */}
        <circle
          cx="200"
          cy="200"
          r="90"
          fill="none"
          stroke={ringColor}
          strokeOpacity="0.6"
          strokeWidth="1.25"
        />

        {/* Radiating lines — eight at 45° intervals */}
        <g
          stroke={ringColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.7"
        >
          <line x1="200" y1="20" x2="200" y2="48" />
          <line x1="200" y1="352" x2="200" y2="380" />
          <line x1="20" y1="200" x2="48" y2="200" />
          <line x1="352" y1="200" x2="380" y2="200" />
          <line x1="73" y1="73" x2="93" y2="93" />
          <line x1="307" y1="307" x2="327" y2="327" />
          <line x1="327" y1="73" x2="307" y2="93" />
          <line x1="73" y1="327" x2="93" y2="307" />
        </g>

        {/* Subtle dim accent dots scattered between rings (brand tone only) */}
        {isBrand && (
          <g fill={ringDimColor} fillOpacity="0.55">
            <circle cx="200" cy="50" r="3" />
            <circle cx="350" cy="200" r="3" />
            <circle cx="200" cy="350" r="3" />
            <circle cx="50" cy="200" r="3" />
          </g>
        )}
      </svg>

      {/* The amount — sits on top, animated entrance via parent.
          Gold $ sign for brand tone, accent for track tone. */}
      <div className="relative z-10">
        <Money
          amount={amount}
          size="xl"
          accentSign={tone === 'track'}
          signColor={isBrand ? '#E9A21C' : undefined}
        />
      </div>
    </div>
  );
}
