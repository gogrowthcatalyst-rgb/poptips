/**
 * Pop Tips icon system — Lucide-based, brand-aware.
 *
 * Why a wrapper module: Lucide gives us crisp, geometric, 2px-stroke icons
 * out of the box, but Lucide's defaults (24px, stroke-width 2) are a bit
 * loud for our type-led aesthetic. We override the stroke-width to 1.5
 * and let size come from Tailwind's height and width utilities so callers
 * can size each icon to its context.
 *
 * Colorize via className: `<Flame className="text-coral-500 h-3.5 w-3.5" />`
 *
 * KEEP-AS-IS (do NOT replace with Lucide):
 * - `✦` (Fraunces sparkle) — the celebration / send-completion mark, brand-mark only
 * - `🥇 🥈 🥉` — leaderboard medals, culturally legible, abstract icons lose meaning
 * - `$` (Fraunces italic dollar) — central to all Money treatment
 *
 * Icons we use everywhere (single import point — see end of file for full list):
 *   ArrowLeft, ArrowRight   — back/forward navigation
 *   Check                   — completed states, onboarding
 *   Flame                   — streak hero stat
 *   Smartphone, Download    — PWA install affordance, QR download
 *   Share2                  — share-link, share-to-stories
 *   MapPin                  — physical location (tipper dashboard map, future)
 *   Star, Award, Trophy     — achievement badge glyphs where the dollar-amount
 *                             pattern doesn't fit
 *   QrCode                  — QR-related labels/buttons in copy
 *   Sparkles                — quiet emphasis on celebration-adjacent moments
 *                             (different from ✦ which is the singular brand mark)
 */

export {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Smartphone,
  Download,
  Share2,
  MapPin,
  Star,
  Award,
  Trophy,
  QrCode,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';

import type { LucideProps } from 'lucide-react';

/**
 * Default Lucide props for Pop Tips usage. Spread into any icon to apply.
 * Lucide accepts `strokeWidth` as a prop directly.
 *
 *   <Flame {...iconDefaults} className="text-coral-500 h-3.5 w-3.5" />
 *
 * In practice, most callers just set className for size + color; we expose
 * this for callsites that need to override stroke (e.g. heavier weight on
 * a big standalone icon).
 */
export const iconDefaults: Partial<LucideProps> = {
  strokeWidth: 1.5,
};
