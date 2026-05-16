import type { Track, TrackId, CopySchema } from './types';

/* =====================================================================
   Accent triplets — only thing that swaps per track.
   Naming convention from SMB Ninja:
     accent      = primary, the main usable color (buttons, links, eyebrow)
     accent-dim  = darker pull for hover/active/depth
     accent-glow = brighter pull for halos, focus rings, soft highlights
   ===================================================================== */

const NEUTRAL_TOKENS = {
  '--accent':      '#4B5669', // ink-500: pre-pick state, quiet authority
  '--accent-dim':  '#283143', // ink-700
  '--accent-glow': '#8A94A7', // ink-300
} as const;

const CORAL_TOKENS = {
  '--accent':      '#F06844', // tipper · warmth of giving
  '--accent-dim':  '#C44A2C',
  '--accent-glow': '#FFA587',
} as const;

const JADE_TOKENS = {
  '--accent':      '#2C6F57', // recipient · depth of earning
  '--accent-dim':  '#1B4F3C',
  '--accent-glow': '#6BA589',
} as const;

/* =====================================================================
   Copy registry — every visible string lives here, keyed.
   Voice rules from the style guide:
     - Direct + specific + warm. ("Your $20 went straight to Rhea.")
     - Numbers + meaning, not manufactured hype.
     - Honest about the business model.
   ===================================================================== */

const NEUTRAL_COPY: CopySchema = {
  'splash.eyebrow':       'Pop Tips',
  'splash.headline':      'A direct line from a moment to the person who made it.',
  'splash.lede':          'Pop Tips routes 100% of every tip straight to the person who served you. We never touch the money.',
  'splash.cta_primary':   'I want to tip',
  'splash.cta_secondary': 'I want to receive tips',
  'role.label':           'Discovery',
  'role.tagline':         'Learn about Pop Tips',
  'money.action_verb':    'send',
  'money.example_amount': '$20.00',
  'footer.tagline':       'Pop Tips · 100% to the worker · instantly',
};

const TIPPER_COPY: CopySchema = {
  'splash.eyebrow':       'For tippers',
  'splash.headline':      'Tip them directly. We get out of the way.',
  'splash.lede':          'Add a card once. Scan, send, done — your $20 lands in their account, not ours.',
  'splash.cta_primary':   'Get my account ready',
  'splash.cta_secondary': 'See how it works',
  'role.label':           'Tipper',
  'role.tagline':         'You make the moment.',
  'money.action_verb':    'send',
  'money.example_amount': '$20.00',
  'footer.tagline':       'Three free tips, then $5 + 3% of what you send. Workers always free.',
};

const RECIPIENT_COPY: CopySchema = {
  'splash.eyebrow':       'For workers',
  'splash.headline':      'Your tips. Your account. Your rules.',
  'splash.lede':          'No employer skim. No payout delay. Your QR points to your Venmo, Cash App, PayPal, or Zelle — your call, every time.',
  'splash.cta_primary':   'Claim my QR code',
  'splash.cta_secondary': 'See sample dashboard',
  'role.label':           'Recipient',
  'role.tagline':         'You earned it.',
  'money.action_verb':    'receive',
  'money.example_amount': '$20.00',
  'footer.tagline':       'Recipients always free. 100% of every tip. Always.',
};

/* =====================================================================
   The registry.
   ===================================================================== */

export const TRACKS: Record<TrackId, Track> = {
  neutral: {
    id: 'neutral',
    label: 'Discovery',
    description: 'Learn about Pop Tips',
    tokens: NEUTRAL_TOKENS,
    copy: NEUTRAL_COPY,
  },
  tipper: {
    id: 'tipper',
    label: 'Tipper',
    description: 'Sign up and start appreciating right away',
    tokens: CORAL_TOKENS,
    copy: TIPPER_COPY,
  },
  recipient: {
    id: 'recipient',
    label: 'Recipient',
    description: 'Receive and track tips, get powerful tools to help you earn more and keep more',
    tokens: JADE_TOKENS,
    copy: RECIPIENT_COPY,
  },
};

export const TRACK_IDS: readonly TrackId[] = ['neutral', 'tipper', 'recipient'];

/* =====================================================================
   Runtime drift guard — TypeScript already enforces CopySchema, but if
   anyone widens the type and forgets to add a key to a track, this
   throws at module load. Cheap, loud, exactly what we want.
   ===================================================================== */

(() => {
  const reference = Object.keys(TRACKS.neutral.copy).sort().join('|');
  for (const id of TRACK_IDS) {
    const got = Object.keys(TRACKS[id].copy).sort().join('|');
    if (got !== reference) {
      throw new Error(
        `[track-engine] Copy key drift in track "${id}".\n  expected: ${reference}\n  got:      ${got}`,
      );
    }
  }
})();
