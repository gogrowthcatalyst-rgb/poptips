'use client';

import { PopCelebrate } from './PopCelebrate';

interface Props {
  size?: number;
  className?: string;
}

/**
 * Home hero "pop" — the bright sun-burst brand icon with a $20 overlay sitting
 * dead center, then a one-shot confetti pop on page load. Visual only (no
 * audio on first-visit; autoplay would be blocked anyway and is intrusive).
 *
 * Replaces the earlier line-drawn PopCircle which read too thin against the
 * hero on entry. The icon's existing white "$" sits behind the overlaid
 * "$20" — they blend cleanly because both are white in the same weight zone.
 */
export function HeroPop({ size = 300, className }: Props) {
  return (
    <PopCelebrate
      playOnMount
      pieces={22}
      spread={size * 0.78}
      className={className}
    >
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Pop Tips — a $20 tip"
      >
        {/* The brand icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/poptipsicon512.png"
          alt=""
          width={size}
          height={size}
          className="hero-icon block h-full w-full select-none object-contain"
          draggable={false}
        />

        {/* $20 centered overlay */}
        <div
          aria-hidden
          className="hero-amt pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span
            className="font-display font-semibold italic text-white"
            style={{
              fontSize: size * 0.34,
              letterSpacing: '-0.02em',
              textShadow:
                '0 2px 10px rgba(0,0,0,0.35), 0 0 28px rgba(0,0,0,0.22), 0 1px 0 rgba(0,0,0,0.25)',
            }}
          >
            $20
          </span>
        </div>
      </div>

      <style>{`
        .hero-icon {
          animation: hero-icon-in 720ms cubic-bezier(0.2, 0.7, 0.3, 1.3) both;
          transform-origin: 50% 50%;
        }
        @keyframes hero-icon-in {
          0%   { transform: scale(0.92); opacity: 0.65; }
          55%  { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .hero-amt {
          animation: hero-amt-in 700ms 180ms cubic-bezier(0.2, 0.8, 0.25, 1.25) both;
          transform-origin: 50% 50%;
        }
        @keyframes hero-amt-in {
          0%   { transform: scale(0.55); opacity: 0; }
          65%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-icon, .hero-amt { animation: none; }
        }
      `}</style>
    </PopCelebrate>
  );
}
