'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Stagger ms — useful for sibling reveals (0, 80, 160, etc.) */
  delay?: number;
  /** Wrapping element. Default 'div'. */
  as?: 'div' | 'section' | 'article' | 'header' | 'li';
  className?: string;
}

/**
 * Reveal-on-scroll wrapper.
 *
 * - Starts hidden (opacity 0, translateY 16px) via the [data-reveal] CSS rule.
 * - On first intersection, sets [data-reveal="in"] which triggers the
 *   transition defined in globals.css.
 * - One-shot: unobserves after triggering. No re-hide on scroll-up.
 * - prefers-reduced-motion is honored by the CSS rule, not here.
 */
export function Reveal({ children, delay = 0, as = 'div', className }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the element is already in view on mount (e.g. above the fold),
    // reveal immediately without waiting for the observer.
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      const t = setTimeout(() => el.setAttribute('data-reveal', 'in'), delay);
      return () => clearTimeout(t);
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTimeout(() => el.setAttribute('data-reveal', 'in'), delay);
            obs.unobserve(el);
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  const Tag = as;
  // @ts-expect-error — ref typing across element variants is fiddly; we know the runtime is fine
  return <Tag ref={ref} data-reveal="" className={className}>{children}</Tag>;
}
