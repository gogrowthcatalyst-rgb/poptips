/**
 * Tipper dashboard placeholder data — the inverted mirror of placeholder-data.ts.
 *
 * Same DB-shape-ready conventions: each export becomes a server-side fetch when
 * Drizzle lands in Session 4. The schema additions for tipper data:
 *   - users.age (optional, asked at signup or in account settings)
 *   - users.city / users.region (derived from billing address or asked)
 *   - tips table already supports outgoing direction via sender_id
 *   - tip_locations table for Mapbox pins (city / lat / lng per sent tip)
 *   - regulars table for one-tap repeat-tip favorites
 *   - leaderboard_opt_ins table for tipper anonymous-vs-revealed preference
 *
 * Use ?empty=1 on /dashboard/tipper to render the zero state for design / QA.
 */

import type { AppDistribution as Distribution, Heatmap, ChartSeries, MiniBarSeries } from './placeholder-data';

// -- TYPES ---------------------------------------------------------------

export interface TipperUser {
  firstName: string;
  lastInitial: string;
  /** Optional — Pete locked age as an optional field for the age-group benchmark feature */
  age?: number;
  city: string;
  region: string;
}

export interface TipperStats {
  lifetime: {
    amount: number;
    tipCount: number;
    /** Distinct workers you've ever appreciated — gamification surface */
    uniqueRecipients: number;
    sinceISO: string;
  };
  thisMonth: {
    amount: number;
    tipCount: number;
    percentVsLastMonth: number;
  };
  /** Appreciation Streak — weeks in a row with at least one tip sent. Pete locked the name. */
  streak: {
    weeks: number;
    sinceLabel: string;
  };
}

export interface Recipient {
  initials: string;
  name: string;
  /** Job title — "Stylist", "Barista", "Uber Driver" */
  role: string;
  /** Geographic identifier — "Brooklyn", "SoHo", "Wake Forest" */
  location: string;
  tipCount: number;
  totalCents: number;
  lastTipLabel: string;
  swatch: 'coral' | 'jade' | 'gold' | 'violet' | 'coral-dark';
}

export interface Regular {
  recipient: Recipient;
  /** Quick-tap amounts in cents — e.g. [500, 1000, 2000] = $5/$10/$20 buttons */
  quickAmountsCents: number[];
  defaultApp: 'Venmo' | 'Cash App' | 'PayPal' | 'Zelle';
}

export interface SentTip {
  recipientInitials: string;
  recipientName: string;
  recipientRole: string;
  timeLabel: string;
  /** What YOU wrote — your appreciation note to them */
  note?: string;
  app: 'Venmo' | 'Cash App' | 'PayPal' | 'Zelle';
  amountCents: number;
  swatch: 'coral' | 'jade' | 'gold' | 'violet' | 'coral-dark';
}

export interface AgeBenchmark {
  /** "30-39" or "All tippers" if user hasn't shared age */
  ageGroup: string;
  /** Monthly tipping average for this age group, in cents */
  groupAvgMonthly: number;
  /** Your own monthly average, in cents */
  yourMonthly: number;
  yourPercentile: number;
  /** Distribution histogram values, 14 bins, 0-100 normalized */
  bins: number[];
  yourBin: number;
  /** Whether the user has provided age — when false, show generic average + a "share age for personalized benchmark" CTA */
  hasAge: boolean;
}

export interface MapPin {
  /** Friendly location name — "Brooklyn Heights" */
  location: string;
  /** City and region — "Brooklyn, NY" */
  city: string;
  lat: number;
  lng: number;
  tipCount: number;
  totalCents: number;
}

export interface TipperAchievement {
  id: string;
  name: string;
  glyph: string;
  unlocked: boolean;
  condition: string;
}

export interface TipperLeaderboardEntry {
  rank: number;
  /** Shown name. Default 'Tipper' for privacy. Real first name only if opted in. */
  displayName: string;
  /** "Age 32 · NYC" or "Top 5% in your city" */
  meta: string;
  amountCents: number;
  medal?: string;
  isYou?: boolean;
  /** Did this user opt into revealing their real name on the leaderboard */
  optedInToReveal?: boolean;
}

// -- DATA ----------------------------------------------------------------

export const PLACEHOLDER_TIPPER_USER: TipperUser = {
  firstName: 'Alex',
  lastInitial: 'M',
  age: 32,
  city: 'Brooklyn',
  region: 'NY',
};

export const PLACEHOLDER_TIPPER_STATS: TipperStats = {
  lifetime: {
    amount: 187250,
    tipCount: 142,
    uniqueRecipients: 47,
    sinceISO: '2025-11-04',
  },
  thisMonth: {
    amount: 31200,
    tipCount: 28,
    percentVsLastMonth: 18,
  },
  streak: { weeks: 9, sinceLabel: 'Mar' },
};

export const PLACEHOLDER_TOP_RECIPIENTS: Recipient[] = [
  { initials: 'MK', name: 'Maria K.',  role: 'Stylist',      location: 'Brooklyn',  tipCount: 12, totalCents: 24000, lastTipLabel: '3 days ago',  swatch: 'jade' },
  { initials: 'JB', name: 'Jordan B.', role: 'Barista',      location: 'SoHo',      tipCount: 9,  totalCents: 11500, lastTipLabel: 'yesterday',   swatch: 'coral' },
  { initials: 'RS', name: 'Ravi S.',   role: 'Uber Driver',  location: 'Brooklyn',  tipCount: 7,  totalCents: 9800,  lastTipLabel: '1 week ago',  swatch: 'gold' },
  { initials: 'DT', name: 'Dana T.',   role: 'Bartender',    location: 'Manhattan', tipCount: 6,  totalCents: 14500, lastTipLabel: '5 days ago', swatch: 'violet' },
  { initials: 'AL', name: 'Aisha L.',  role: 'Massage Therapist', location: 'Park Slope', tipCount: 5,  totalCents: 16000, lastTipLabel: '2 weeks ago', swatch: 'coral-dark' },
];

export const PLACEHOLDER_REGULARS: Regular[] = [
  {
    recipient: PLACEHOLDER_TOP_RECIPIENTS[0]!,
    quickAmountsCents: [500, 1000, 2000],
    defaultApp: 'Venmo',
  },
  {
    recipient: PLACEHOLDER_TOP_RECIPIENTS[1]!,
    quickAmountsCents: [200, 500, 1000],
    defaultApp: 'Cash App',
  },
  {
    recipient: PLACEHOLDER_TOP_RECIPIENTS[2]!,
    quickAmountsCents: [500, 1000, 1500],
    defaultApp: 'Venmo',
  },
];

export const PLACEHOLDER_SENT_TIPS: SentTip[] = [
  { recipientInitials: 'MK', recipientName: 'Maria K.', recipientRole: 'Stylist',          timeLabel: 'Today · 2:14pm',   note: 'thank you for the color magic ✨', app: 'Venmo',    amountCents: 2000, swatch: 'jade' },
  { recipientInitials: 'JB', recipientName: 'Jordan B.', recipientRole: 'Barista',          timeLabel: 'Today · 8:32am',   app: 'Cash App', amountCents: 300,  swatch: 'coral' },
  { recipientInitials: 'RS', recipientName: 'Ravi S.', recipientRole: 'Uber Driver',         timeLabel: 'Yesterday · 11:48pm', note: 'great late-night ride', app: 'Venmo', amountCents: 1000, swatch: 'gold' },
  { recipientInitials: 'AN', recipientName: 'Hotel housekeeping', recipientRole: 'Hotel staff', timeLabel: 'Yesterday · 9:00am', note: 'thank you for the spotless room', app: 'Zelle', amountCents: 2500, swatch: 'violet' },
  { recipientInitials: 'DT', recipientName: 'Dana T.', recipientRole: 'Bartender',           timeLabel: 'Sat · 11:30pm',   app: 'PayPal',   amountCents: 3000, swatch: 'coral-dark' },
  { recipientInitials: 'AL', recipientName: 'Aisha L.', recipientRole: 'Massage Therapist',  timeLabel: 'Fri · 3:15pm',    note: 'best 90 minutes of my month', app: 'Venmo', amountCents: 4000, swatch: 'jade' },
];

export const PLACEHOLDER_TIPPER_ACHIEVEMENTS: TipperAchievement[] = [
  { id: 'first-tip',       name: 'First Tip Sent',      glyph: '✦',  unlocked: true,  condition: 'Unlocked Nov 4' },
  { id: 'recip-10',        name: '10 Unique Recipients', glyph: '★', unlocked: true,  condition: 'Unlocked Dec 14' },
  { id: 'club-100',        name: '$100 Given',          glyph: '100', unlocked: true,  condition: 'Unlocked Nov 22' },
  { id: 'club-500',        name: '$500 Given',          glyph: '500', unlocked: true,  condition: 'Unlocked Feb 6' },
  { id: 'club-1k',         name: '$1k Given',           glyph: '1K',  unlocked: true,  condition: 'Unlocked Mar 28' },
  { id: 'streak-4',        name: '4-Week Streak',       glyph: '🔥', unlocked: true,  condition: 'Unlocked Apr 9' },
  { id: 'repeat-tipper',   name: 'Repeat Tipper',       glyph: '↻',  unlocked: true,  condition: 'Tipped same person 5x' },
  { id: 'far-wide',        name: 'Far & Wide',          glyph: '◌',  unlocked: false, condition: 'Tip in 10 different cities' },
  { id: 'generous-soul',   name: 'Generous Soul',       glyph: '✦',  unlocked: false, condition: 'Top 10% by age group' },
  { id: 'recip-50',        name: '50 Unique Recipients', glyph: '50', unlocked: false, condition: '3 more to go' },
  { id: 'club-2_5k',       name: '$2.5k Given',         glyph: '2.5', unlocked: false, condition: '$622 to go' },
  { id: 'streak-26',       name: 'Half-Year Streak',    glyph: '26',  unlocked: false, condition: '17 more weeks' },
];

export const PLACEHOLDER_AGE_BENCHMARK: AgeBenchmark = {
  ageGroup: '30-39',
  groupAvgMonthly: 4520,
  yourMonthly: 31200 / 4, // approximated weekly avg from monthly total
  yourPercentile: 18,
  bins: [22, 38, 55, 72, 90, 100, 88, 70, 52, 38, 25, 14, 9, 5],
  yourBin: 8,
  hasAge: true,
};

export const PLACEHOLDER_TIPPER_APP_DISTRIBUTION: Distribution = {
  venmo: 58,
  cashapp: 22,
  paypal: 10,
  zelle: 10,
};

// When YOU tip — patterns differ from when you receive. Morning coffee runs,
// late-night rideshares, weekend dinners.
export const PLACEHOLDER_TIPPER_HEATMAP: Heatmap = [
  [1, 2, 1, 2, 1, 0], // Mon — coffee + dinner
  [1, 2, 1, 2, 1, 0], // Tue
  [1, 2, 1, 2, 2, 1], // Wed
  [1, 2, 2, 3, 2, 1], // Thu
  [2, 2, 2, 4, 3, 2], // Fri — full evening
  [2, 3, 3, 4, 4, 2], // Sat — dinner + bars + late-night Uber
  [2, 3, 2, 3, 1, 0], // Sun — brunch + early dinner
];

export const PLACEHOLDER_TIPPER_MONTH_BARS: MiniBarSeries = [25, 42, 38, 60, 55, 75, 70, 100];

export const PLACEHOLDER_TIPPER_CHART_SERIES: ChartSeries = [
  { day: 'Apr 16', cents: 500 },  { day: 'Apr 17', cents: 800 },  { day: 'Apr 18', cents: 1200 },
  { day: 'Apr 19', cents: 700 },  { day: 'Apr 20', cents: 1100 }, { day: 'Apr 21', cents: 900 },
  { day: 'Apr 22', cents: 1500 }, { day: 'Apr 23', cents: 1300 }, { day: 'Apr 24', cents: 1000 },
  { day: 'Apr 25', cents: 1800 }, { day: 'Apr 26', cents: 2000 }, { day: 'Apr 27', cents: 1600 },
  { day: 'Apr 28', cents: 1400 }, { day: 'Apr 29', cents: 1700 }, { day: 'Apr 30', cents: 2100 },
  { day: 'May 1',  cents: 1900 }, { day: 'May 2',  cents: 2200 }, { day: 'May 3',  cents: 2400 },
  { day: 'May 4',  cents: 2000 }, { day: 'May 5',  cents: 2100 }, { day: 'May 6',  cents: 2500 },
  { day: 'May 7',  cents: 2700 }, { day: 'May 8',  cents: 2300 }, { day: 'May 9',  cents: 2800 },
  { day: 'May 10', cents: 3000 }, { day: 'May 11', cents: 2900 }, { day: 'May 12', cents: 3100 },
  { day: 'May 13', cents: 3300 }, { day: 'May 14', cents: 3200 }, { day: 'May 15', cents: 3500 },
];

export const PLACEHOLDER_MAP_PINS: MapPin[] = [
  { location: 'Brooklyn Heights',   city: 'Brooklyn, NY',     lat: 40.6957, lng: -73.9938, tipCount: 18, totalCents: 22400 },
  { location: 'SoHo',                city: 'Manhattan, NY',     lat: 40.7235, lng: -74.0006, tipCount: 14, totalCents: 8900 },
  { location: 'Park Slope',          city: 'Brooklyn, NY',     lat: 40.6710, lng: -73.9814, tipCount: 12, totalCents: 18200 },
  { location: 'Williamsburg',        city: 'Brooklyn, NY',     lat: 40.7081, lng: -73.9571, tipCount: 9,  totalCents: 11500 },
  { location: 'East Village',        city: 'Manhattan, NY',     lat: 40.7264, lng: -73.9818, tipCount: 7,  totalCents: 9200 },
  { location: 'Downtown LA',         city: 'Los Angeles, CA',  lat: 34.0407, lng: -118.2468, tipCount: 5, totalCents: 7600 },
  { location: 'Mission District',    city: 'San Francisco, CA', lat: 37.7599, lng: -122.4148, tipCount: 4, totalCents: 5400 },
  { location: 'South Beach',         city: 'Miami, FL',        lat: 25.7826, lng: -80.1340, tipCount: 3,  totalCents: 6800 },
];

export const PLACEHOLDER_TIPPER_LEADERBOARD: TipperLeaderboardEntry[] = [
  { rank: 1, displayName: 'Tipper',     meta: 'Age 28 · Manhattan',    amountCents: 87400, medal: '🥇' },
  { rank: 2, displayName: 'Tipper',     meta: 'Age 35 · Brooklyn',     amountCents: 71200, medal: '🥈' },
  { rank: 3, displayName: 'Tipper',     meta: 'Age 31 · Queens',       amountCents: 64500, medal: '🥉' },
  { rank: 4, displayName: 'Marcus J.',  meta: 'Age 34 · Brooklyn',     amountCents: 58300, optedInToReveal: true },
  { rank: 5, displayName: 'Tipper',     meta: 'Age 29 · Manhattan',    amountCents: 52800 },
  { rank: 12, displayName: 'You',       meta: 'Top 18% · Age 30-39 · Brooklyn', amountCents: 31200, isYou: true },
];

export const TIPPER_ONBOARDING_STEPS = [
  {
    id: 'profile',
    title: 'Profile claimed',
    body: 'Your tipper account is set up. Card added, ready to send appreciation.',
    cta: 'Done',
    done: true,
  },
  {
    id: 'scan',
    title: 'Send your first tip',
    body: 'Find a worker\u2019s QR code at their salon, on their apron, on their card. Scan and send — your first three are on us.',
    cta: 'How to scan →',
    done: false,
  },
  {
    id: 'regulars',
    title: 'Save your regulars',
    body: 'After a few tips, save your repeat recipients for one-tap appreciation. Your barista, your stylist, your Friday-night bartender.',
    cta: 'Learn how →',
    done: false,
  },
];

// -- HELPERS -------------------------------------------------------------

export function getEmptyTipperData() {
  return {
    user: PLACEHOLDER_TIPPER_USER,
    stats: {
      lifetime: { amount: 0, tipCount: 0, uniqueRecipients: 0, sinceISO: '' },
      thisMonth: { amount: 0, tipCount: 0, percentVsLastMonth: 0 },
      streak: { weeks: 0, sinceLabel: '' },
    },
    topRecipients: [] as Recipient[],
    regulars: [] as Regular[],
    sentTips: [] as SentTip[],
    achievements: PLACEHOLDER_TIPPER_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false })),
    ageBenchmark: { ...PLACEHOLDER_AGE_BENCHMARK, yourMonthly: 0, yourBin: -1, hasAge: false },
    appDistribution: { venmo: 0, cashapp: 0, paypal: 0, zelle: 0 },
    heatmap: Array.from({ length: 7 }, () => Array(6).fill(0)) as Heatmap,
    monthBars: Array(8).fill(0) as MiniBarSeries,
    chartSeries: [] as ChartSeries,
    mapPins: [] as MapPin[],
    leaderboard: [] as TipperLeaderboardEntry[],
  };
}

export function getActiveTipperData() {
  return {
    user: PLACEHOLDER_TIPPER_USER,
    stats: PLACEHOLDER_TIPPER_STATS,
    topRecipients: PLACEHOLDER_TOP_RECIPIENTS,
    regulars: PLACEHOLDER_REGULARS,
    sentTips: PLACEHOLDER_SENT_TIPS,
    achievements: PLACEHOLDER_TIPPER_ACHIEVEMENTS,
    ageBenchmark: PLACEHOLDER_AGE_BENCHMARK,
    appDistribution: PLACEHOLDER_TIPPER_APP_DISTRIBUTION,
    heatmap: PLACEHOLDER_TIPPER_HEATMAP,
    monthBars: PLACEHOLDER_TIPPER_MONTH_BARS,
    chartSeries: PLACEHOLDER_TIPPER_CHART_SERIES,
    mapPins: PLACEHOLDER_MAP_PINS,
    leaderboard: PLACEHOLDER_TIPPER_LEADERBOARD,
  };
}
