'use client';

import { useRef, useState } from 'react';
import { Logo } from './Logo';

const CONFETTI_COLORS = [
  '#F06844', // coral
  '#E9A21C', // gold
  '#2C6F57', // jade
  '#FFA587', // coral-300
  '#FFEBC2', // gold-100
  '#6BA589', // jade-300
];

/**
 * Dark celebration block — the brand's "loud on purpose" moment.
 *
 * Confetti pieces are spawned via requestAnimationFrame batching so mobile
 * Safari doesn't drop pieces under rapid synchronous appendChild pressure.
 * Each piece gets a slightly randomized size, color, distance, and rotation
 * to feel organic rather than mechanical. The gold-flash overlay radiates
 * from the button center on burst, reinforcing "it landed."
 *
 * Keyframes live in globals.css (not Tailwind config) so production CSS
 * always includes them, since Tailwind JIT purges unreferenced @keyframes.
 */
export function CelebrationBlock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [flashing, setFlashing] = useState(false);
  const [bursting, setBursting] = useState(false);
  const [count, setCount] = useState(0);

  const fire = () => {
    setFlashing(false);
    setBursting(false);
    // Force reflow so flash + burst classes re-apply cleanly on rapid taps
    void containerRef.current?.offsetWidth;
    setFlashing(true);
    setBursting(true);
    setCount((c) => c + 1);

    const container = containerRef.current;
    const button = buttonRef.current;
    if (!container || !button) return;

    const rect = button.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    const originX = rect.left - cRect.left + rect.width / 2;
    const originY = rect.top - cRect.top + rect.height / 2;

    const pieces = 32;

    // Use rAF to batch spawn across two frames — keeps mobile Safari from
    // dropping pieces under synchronous appendChild pressure
    const spawn = (start: number, end: number) => {
      for (let i = start; i < end; i++) {
        const piece = document.createElement('div');
        // Vary size for organic feel — small confetti (6-10px) and medium (10-14px)
        const w = 6 + Math.random() * 6;
        const h = w + 2 + Math.random() * 4;

        piece.style.position = 'absolute';
        piece.style.left = `${originX}px`;
        piece.style.top = `${originY}px`;
        piece.style.width = `${w}px`;
        piece.style.height = `${h}px`;
        piece.style.borderRadius = '2px';
        piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length] ?? '#F06844';
        piece.style.opacity = '0';
        piece.style.pointerEvents = 'none';
        piece.style.zIndex = '20';
        piece.style.willChange = 'transform, opacity';

        // Distribute pieces around full circle with some jitter; slight upward bias
        const angle = (i / pieces) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist = 200 + Math.random() * 100; // 200-300px spread
        const cx = Math.cos(angle) * dist;
        const cy = Math.sin(angle) * dist - 20; // -20 for slight upward bias

        piece.style.setProperty('--cx', `${cx}px`);
        piece.style.setProperty('--cy', `${cy}px`);
        piece.style.setProperty('--cr', `${Math.random() * 720 - 360}deg`);

        const duration = 1200 + Math.random() * 600; // 1200-1800ms
        piece.style.animation = `confetti-burst ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`;

        container.appendChild(piece);
        setTimeout(() => piece.remove(), duration + 100);
      }
    };

    // Half the pieces this frame, half next frame
    spawn(0, pieces / 2);
    requestAnimationFrame(() => spawn(pieces / 2, pieces));

    setTimeout(() => setFlashing(false), 1800);
    setTimeout(() => setBursting(false), 900);
  };

  return (
    <div
      ref={containerRef}
      className="relative isolate flex min-h-[440px] flex-col items-center justify-center overflow-hidden rounded-[32px] bg-ink px-6 py-16 text-paper md:py-20"
    >
      {/* Decorative radial glow that breathes */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(233,162,28,0.4) 0%, rgba(240,104,68,0.15) 40%, transparent 70%)',
        }}
      />

      {/* Logo, quiet at the top */}
      <Logo
        variant="h-white"
        height={28}
        alt="Pop Tips"
        className="relative mb-8 opacity-80"
      />

      <p className="relative mb-3 font-mono text-xs uppercase tracking-wider2 text-gold-500">
        06 · The moment
      </p>

      <h2 className="relative max-w-2xl text-center font-display text-4xl font-medium leading-[1.05] tracking-tightest text-paper md:text-5xl lg:text-6xl">
        When a tip <em className="italic text-gold-100">lands.</em>
      </h2>

      <p className="relative mx-auto mt-4 max-w-md text-center text-base leading-relaxed text-ink-faint md:text-lg">
        One crisp moment. A clean pop of gold that says <em>it landed.</em>
      </p>

      {/* Gold flash overlay — radiates from button center on burst */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: '50%',
          top: '68%',
          width: '320px',
          height: '320px',
          background:
            'radial-gradient(circle, rgba(233,162,28,0.55) 0%, rgba(233,162,28,0.25) 35%, transparent 65%)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%) scale(0.4)',
          opacity: 0,
          animation: bursting
            ? 'gold-flash 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
            : undefined,
          zIndex: 5,
        }}
      />

      {/* The button — the moment-maker */}
      <button
        ref={buttonRef}
        type="button"
        onClick={fire}
        className="relative z-10 mt-10 inline-flex items-center gap-3 rounded-full bg-gold-500 px-8 py-4 text-base font-medium text-ink shadow-halo-gold transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-gold-100 hover:shadow-lift-strong active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500"
      >
        <span>Send a $20 tip</span>
        <span aria-hidden>✦</span>
      </button>

      {/* The flash — solid pill (no backdrop-blur; that fuzzed on iOS Safari).
          Larger text and padding on mobile so it reads cleanly at thumb size. */}
      <div
        aria-live="polite"
        className={`pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-gold-500/40 bg-ink/95 px-6 py-3 font-display text-lg italic text-gold-100 shadow-lift transition-all duration-300 md:bottom-12 md:px-5 md:py-2.5 md:text-lg ${
          flashing ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        Thank you sent. <span className="ml-1 text-gold-500">✦</span>
        {count > 1 && (
          <span className="ml-2 font-mono text-xs uppercase tracking-wider2 text-gold-500/70">
            ×{count}
          </span>
        )}
      </div>
    </div>
  );
}
