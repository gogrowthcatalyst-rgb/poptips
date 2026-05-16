/**
 * Track Engine — type contracts.
 *
 * Discipline:
 *   - The accent triplet is the only thing that swaps on :root per track.
 *     Paper, surface, ink, line, signal stay constant — track signal lives
 *     in the accent layer alone, so the brand reads warm everywhere.
 *   - The copy schema is exhaustive — every visible string in the app
 *     enters here as a key. Hardcoded English in JSX is a regression.
 *   - Every track must implement every key. TypeScript enforces it;
 *     `tracks.ts` includes a runtime guard as a belt-and-suspenders check.
 */

export type TrackId = 'neutral' | 'tipper' | 'recipient';

/** The three accent CSS vars the engine swaps. Names match tailwind.config.ts. */
export interface TrackTokens {
  '--accent': string;
  '--accent-dim': string;
  '--accent-glow': string;
}

export interface CopySchema {
  // Marketing surface
  'splash.eyebrow': string;
  'splash.headline': string;
  'splash.lede': string;
  'splash.cta_primary': string;
  'splash.cta_secondary': string;

  // Identity
  'role.label': string;
  'role.tagline': string;

  // Money frame — verb varies by side of the transaction
  'money.action_verb': string;
  'money.example_amount': string;

  // Footer
  'footer.tagline': string;
}

export type CopyKey = keyof CopySchema;

export interface Track {
  id: TrackId;
  label: string;
  description: string;
  tokens: TrackTokens;
  copy: CopySchema;
}
