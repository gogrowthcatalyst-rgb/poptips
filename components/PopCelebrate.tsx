'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

/**
 * PopCelebrate — externally-controllable brand "pop" moment.
 *
 * Shares the confetti-burst keyframe + brand palette with CelebrationBlock
 * (which is the dedicated "section 06" demo block on the home page) so every
 * Pop Tips celebration reads as the same gesture. This component is the
 * small, inline version: wraps any child, can play on mount or on a trigger,
 * plays optional audio, and respects prefers-reduced-motion.
 *
 * Why a new primitive instead of reusing CelebrationBlock: CelebrationBlock
 * is a self-contained block with its own dark frame, headline, and inner
 * button. PopCelebrate is the inline version for the hero icon, the send-
 * tap moment, and dashboard arrival — same look, different chrome.
 */

const COLORS = [
  '#E9A21C', // gold — the celebration anchor
  '#F06844', // coral
  '#FFA587', // coral-300
  '#FFEBC2', // gold-100
  '#2C6F57', // jade
  '#6BA589', // jade-300
];

interface Props {
  /** Toggle false→true to play a single burst. */
  play?: boolean;
  /** Play once on mount (overrides `play`). */
  playOnMount?: boolean;
  /** Optional success-flash message overlaid during the burst. */
  message?: string;
  /** Optional audio file (e.g. "/sounds/tip-celebrate.mp3"). Plays once per burst. */
  audioSrc?: string;
  /** Fires after the burst finishes (~1.4s). Useful for chaining a redirect. */
  onComplete?: () => void;
  /** Pieces in the burst. Default 18 (restrained — "no confetti storms"). */
  pieces?: number;
  /** Burst spread in px from center. Default 140. */
  spread?: number;
  children?: React.ReactNode;
  className?: string;
}

const TOTAL_MS = 1400;
const FLASH_MS = 1600;

export function PopCelebrate({
  play,
  playOnMount = false,
  message,
  audioSrc,
  onComplete,
  pieces = 18,
  spread = 140,
  children,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const reducedMotionRef = useRef(false);
  const firstRunRef = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    reducedMotionRef.current =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  const fire = () => {
    const container = containerRef.current;
    if (!container) return;

    // audio first, in the same user-gesture tick when possible
    if (audioSrc && audioRef.current && !reducedMotionRef.current) {
      try {
        audioRef.current.currentTime = 0;
        const p = audioRef.current.play();
        if (p && typeof p.catch === 'function') p.catch(() => undefined);
      } catch {
        /* silently ignored — visual still plays */
      }
    }

    if (reducedMotionRef.current) {
      // Honor prefers-reduced-motion: no sparkles. Still flash the message briefly.
      if (message) flashMessage(container);
      if (onComplete) window.setTimeout(onComplete, 350);
      return;
    }

    // Burst origin: container center.
    const rect = container.getBoundingClientRect();
    const ox = rect.width / 2;
    const oy = rect.height / 2;

    const spawn = (start: number, end: number) => {
      for (let i = start; i < end; i += 1) {
        const piece = document.createElement('div');
        const w = 6 + Math.random() * 5;
        const h = w + 2 + Math.random() * 4;
        const angle = (i / pieces) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const dist = spread + Math.random() * (spread * 0.5);
        const cx = Math.cos(angle) * dist;
        const cy = Math.sin(angle) * dist - 16;
        const cr = Math.random() * 720 - 360;
        const dur = 1100 + Math.random() * 500;

        piece.style.position = 'absolute';
        piece.style.left = `${ox}px`;
        piece.style.top = `${oy}px`;
        piece.style.width = `${w}px`;
        piece.style.height = `${h}px`;
        piece.style.borderRadius = '2px';
        piece.style.background = COLORS[i % COLORS.length] ?? '#E9A21C';
        piece.style.opacity = '0';
        piece.style.pointerEvents = 'none';
        piece.style.zIndex = '30';
        piece.style.willChange = 'transform, opacity';
        piece.style.setProperty('--cx', `${cx}px`);
        piece.style.setProperty('--cy', `${cy}px`);
        piece.style.setProperty('--cr', `${cr}deg`);
        piece.style.animation = `confetti-burst ${dur}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`;

        container.appendChild(piece);
        window.setTimeout(() => piece.remove(), dur + 100);
      }
    };

    // Split spawn across two frames (mobile Safari mercy).
    spawn(0, Math.floor(pieces / 2));
    requestAnimationFrame(() => spawn(Math.floor(pieces / 2), pieces));

    if (message) flashMessage(container);
    if (onComplete) window.setTimeout(onComplete, TOTAL_MS);
  };

  const flashMessage = (container: HTMLElement) => {
    const flash = document.createElement('div');
    flash.textContent = message || '';
    flash.style.position = 'absolute';
    flash.style.left = '50%';
    flash.style.top = '50%';
    flash.style.transform = 'translate(-50%, -50%)';
    flash.style.fontFamily = "'Fraunces', Georgia, serif";
    flash.style.fontStyle = 'italic';
    flash.style.fontWeight = '500';
    flash.style.fontSize = '28px';
    flash.style.color = '#E9A21C';
    flash.style.textShadow = '0 2px 14px rgba(255,255,255,0.55)';
    flash.style.pointerEvents = 'none';
    flash.style.opacity = '0';
    flash.style.zIndex = '31';
    flash.style.whiteSpace = 'nowrap';
    flash.style.animation = `gold-flash ${FLASH_MS}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`;
    container.appendChild(flash);
    window.setTimeout(() => flash.remove(), FLASH_MS + 100);
  };

  // Mount: optionally auto-fire.
  useEffect(() => {
    if (!playOnMount) return;
    // Slight delay so layout settles before measuring container.
    const t = window.setTimeout(fire, 80);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playOnMount]);

  // External trigger: fire whenever `play` transitions to true.
  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    if (play) fire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);

  return (
    <div ref={containerRef} className={cn('relative isolate', className)}>
      {children}
      {audioSrc ? (
        <audio ref={audioRef} src={audioSrc} preload="none" aria-hidden />
      ) : null}
    </div>
  );
}
