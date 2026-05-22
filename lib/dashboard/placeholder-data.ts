/**
 * Dashboard placeholder data.
 *
 * Every value here is a stand-in for what will come from the DB starting
 * in Session 4 (Drizzle schema) and Session 5 (Stripe + tip ledger). The
 * shape of each export is intentionally close to the real schema so the
 * swap is mostly mechanical:
 *
 *   - PLACEHOLDER_USER → SELECT FROM users
 *   - PLACEHOLDER_STATS → aggregations over tips table
 *   - PLACEHOLDER_TIPS → SELECT FROM tips ORDER BY created_at DESC
 *   - PLACEHOLDER_TIPPERS → aggregations over tips JOIN users (tippers)
 *
 * Use ?empty=1 on the dashboard URL to render the zero state during
 * design / QA — getDashboardData() reads that query and returns either
 * the full set or zeroed-out versions.
 */

export interface DashboardUser {
  firstName: string;
  lastInitial: string;
  handle: string;
  role: string;
  establishment: string;
  category: string;
}

export interface DashboardStats {
  lifetime: { amount: number; tipCount: number; sinceISO: string };
  thisMonth: { amount: number; tipCount: number; percentVsLastMonth: number };
  streak: { weeks: number; sinceLabel: string };
  avgTip: number;
  scannedThisWeek: number;
}

export interface Appreciator {
  initials: string;
  name: string;
  tipCount: number;
  totalCents: number;
  lastTipLabel: string;
  /** Visual swatch for avatar — coral|jade|gold|violet|coral-dark */
  swatch: 'coral' | 'jade' | 'gold' | 'violet' | 'coral-dark';
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  meta: string;
  amountCents: number;
  /** Optional medal — 🥇 🥈 🥉 */
  medal?: string;
  /** Whether this row is the current user */
  isYou?: boolean;
}

export interface RecentTip {
  initials: string;
  name: string;
  timeLabel: string;
  note?: string;
  app: 'Venmo' | 'Cash App' | 'PayPal';
  amountCents: number;
  swatch: 'coral' | 'jade' | 'gold' | 'violet' | 'coral-dark';
}

export interface Achievement {
  id: string;
  name: string;
  /** Short visual marker — number or symbol shown inside the badge circle */
  glyph: string;
  unlocked: boolean;
  /** When unlocked: e.g. "Unlocked Mar 4". When locked: e.g. "$2,153 to go" */
  condition: string;
}

export interface CategoryBenchmark {
  category: string;
  averageCents: number;
  yourAverageCents: number;
  yourPercentile: number;
  /** Distribution histogram values, 14 bins, 0–100 normalized heights.
   *  yourBin is the index of the bin where this user falls. */
  bins: number[];
  yourBin: number;
}

export interface AppDistribution {
  venmo: number;
  cashapp: number;
  paypal: number;
}

/** 7 days × 6 time blocks. Each value 0–4 (intensity bucket). */
export type Heatmap = number[][];

/** 4-week mini bar chart for "this month" stat card. 8 weeks of history. */
export type MiniBarSeries = number[];

/** Daily $ totals for the main tips-over-time chart (last 30 days). */
export type ChartSeries = { day: string; cents: number }[];

// -- DATA ----------------------------------------------------------------

export const PLACEHOLDER_USER: DashboardUser = {
  firstName: 'Sam',
  lastInitial: 'R',
  handle: 'sam-r',
  role: 'Stylist',
  establishment: 'The Edit Salon',
  category: 'Stylists & Beauty',
};

export const PLACEHOLDER_STATS: DashboardStats = {
  lifetime: { amount: 284700, tipCount: 312, sinceISO: '2026-02-12' },
  thisMonth: { amount: 48700, tipCount: 47, percentVsLastMonth: 23 },
  streak: { weeks: 14, sinceLabel: 'Feb' },
  avgTip: 912,
  scannedThisWeek: 83,
};

export const PLACEHOLDER_APPRECIATORS: Appreciator[] = [
  { initials: 'MK', name: 'Maria K.', tipCount: 18, totalCents: 24000, lastTipLabel: 'last Tue', swatch: 'coral' },
  { initials: 'JB', name: 'Jordan B.', tipCount: 12, totalCents: 18000, lastTipLabel: '3 days ago', swatch: 'jade' },
  { initials: 'RS', name: 'Rachel S.', tipCount: 9, totalCents: 13500, lastTipLabel: '1 week ago', swatch: 'gold' },
  { initials: 'DT', name: 'Dan T.', tipCount: 7, totalCents: 12000, lastTipLabel: '2 weeks ago', swatch: 'violet' },
  { initials: 'AL', name: 'Aisha L.', tipCount: 6, totalCents: 9500, lastTipLabel: '4 days ago', swatch: 'coral-dark' },
];

export const PLACEHOLDER_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Tasha M.', meta: 'Stylist · Houston', amountCents: 124700, medal: '🥇' },
  { rank: 2, name: 'Chris D.', meta: 'Stylist · Brooklyn', amountCents: 98700, medal: '🥈' },
  { rank: 3, name: 'Priya R.', meta: 'Stylist · Los Angeles', amountCents: 84300, medal: '🥉' },
  { rank: 4, name: 'Mike F.', meta: 'Stylist · Denver', amountCents: 72100 },
  { rank: 5, name: 'Avery N.', meta: 'Stylist · Chicago', amountCents: 65500 },
  { rank: 47, name: 'You', meta: 'Top 12% · Stylists category', amountCents: 48700, isYou: true },
];

export const PLACEHOLDER_RECENT_TIPS: RecentTip[] = [
  { initials: 'MK', name: 'Maria K.', timeLabel: 'Today · 2:14pm', note: 'thanks for the color magic ✨', app: 'Venmo', amountCents: 2000, swatch: 'coral' },
  { initials: 'JB', name: 'Jordan B.', timeLabel: 'Today · 11:48am', app: 'Cash App', amountCents: 1500, swatch: 'jade' },
  { initials: 'RS', name: 'Rachel S.', timeLabel: 'Yesterday · 6:22pm', app: 'Venmo', amountCents: 1000, swatch: 'gold' },
  { initials: 'AN', name: 'Anonymous', timeLabel: 'Yesterday · 4:01pm', note: "best cut I've had in years", app: 'PayPal', amountCents: 2500, swatch: 'gold' },
  { initials: 'DT', name: 'Dan T.', timeLabel: 'Mon · 7:30pm', app: 'PayPal', amountCents: 3000, swatch: 'coral-dark' },
  { initials: 'AL', name: 'Aisha L.', timeLabel: 'Sat · 3:15pm', note: 'the color is perfect', app: 'Venmo', amountCents: 1200, swatch: 'jade' },
];

export const PLACEHOLDER_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-tip',        name: 'First Tip',         glyph: '✦',  unlocked: true,  condition: 'Unlocked Feb 12' },
  { id: 'club-100',         name: '$100 Club',         glyph: '100', unlocked: true,  condition: 'Unlocked Feb 28' },
  { id: 'tippers-10',       name: '10 Unique Tippers', glyph: '★',  unlocked: true,  condition: 'Unlocked Mar 4' },
  { id: 'streak-4',         name: '4-Week Streak',     glyph: '🔥', unlocked: true,  condition: 'Unlocked Mar 12' },
  { id: 'club-500',         name: '$500 Club',         glyph: '500', unlocked: true,  condition: 'Unlocked Mar 24' },
  { id: 'club-1k',          name: '$1k Club',          glyph: '1K',  unlocked: true,  condition: 'Unlocked Apr 18' },
  { id: 'club-2_5k',        name: '$2.5k Club',        glyph: '2.5', unlocked: true,  condition: 'Unlocked today!' },
  { id: 'club-5k',          name: '$5k Club',          glyph: '5K',  unlocked: false, condition: '$2,153 to go' },
  { id: 'club-10k',         name: '$10k Club',         glyph: '10K', unlocked: false, condition: '$7,153 to go' },
  { id: 'streak-26',        name: 'Half-Year Streak',  glyph: '26',  unlocked: false, condition: '12 more weeks' },
  { id: 'tippers-50',       name: '50 Unique Tippers', glyph: '50',  unlocked: false, condition: '14 more to go' },
  { id: 'category-top-10',  name: 'Top 10% in category', glyph: '★', unlocked: false, condition: 'Currently top 12%' },
];

export const PLACEHOLDER_BENCHMARK: CategoryBenchmark = {
  category: 'Stylists & Beauty',
  averageCents: 720,
  yourAverageCents: 912,
  yourPercentile: 12,
  bins: [20, 32, 50, 68, 85, 100, 92, 78, 65, 50, 38, 22, 14, 8],
  yourBin: 9,
};

export const PLACEHOLDER_APP_DISTRIBUTION: AppDistribution = {
  venmo: 52,
  cashapp: 28,
  paypal: 12,
};

// 7 rows (Mon → Sun), 6 time blocks (6a, 10a, 2p, 6p, 10p, 2a)
export const PLACEHOLDER_HEATMAP: Heatmap = [
  [0, 1, 2, 3, 2, 1], // Mon
  [0, 1, 2, 3, 2, 2], // Tue
  [1, 2, 3, 4, 3, 2], // Wed
  [1, 2, 3, 4, 4, 3], // Thu
  [2, 3, 4, 4, 4, 4], // Fri
  [2, 3, 4, 4, 3, 3], // Sat
  [1, 2, 3, 2, 1, 0], // Sun
];

// 8 weeks of recent activity for "this month" mini bar chart, % heights
export const PLACEHOLDER_MONTH_BARS: MiniBarSeries = [30, 55, 42, 70, 65, 85, 78, 100];

// 30 days of $ totals for the main tips-over-time chart. Cents.
// Trend: roughly upward over the month, with noise.
export const PLACEHOLDER_CHART_SERIES: ChartSeries = [
  { day: 'Apr 16', cents: 800 }, { day: 'Apr 17', cents: 1200 }, { day: 'Apr 18', cents: 950 },
  { day: 'Apr 19', cents: 1450 }, { day: 'Apr 20', cents: 1100 }, { day: 'Apr 21', cents: 1300 },
  { day: 'Apr 22', cents: 1850 }, { day: 'Apr 23', cents: 1700 }, { day: 'Apr 24', cents: 1500 },
  { day: 'Apr 25', cents: 2100 }, { day: 'Apr 26', cents: 1900 }, { day: 'Apr 27', cents: 1750 },
  { day: 'Apr 28', cents: 2300 }, { day: 'Apr 29', cents: 2050 }, { day: 'Apr 30', cents: 1850 },
  { day: 'May 1',  cents: 2400 }, { day: 'May 2',  cents: 2150 }, { day: 'May 3',  cents: 2500 },
  { day: 'May 4',  cents: 2700 }, { day: 'May 5',  cents: 2300 }, { day: 'May 6',  cents: 2900 },
  { day: 'May 7',  cents: 3100 }, { day: 'May 8',  cents: 2750 }, { day: 'May 9',  cents: 3400 },
  { day: 'May 10', cents: 3200 }, { day: 'May 11', cents: 3600 }, { day: 'May 12', cents: 3300 },
  { day: 'May 13', cents: 3900 }, { day: 'May 14', cents: 3700 }, { day: 'May 15', cents: 4200 },
];

// Onboarding steps — for the Day-1 zero state checklist
export const ONBOARDING_STEPS = [
  {
    id: 'profile',
    title: 'Profile claimed',
    body: 'pop.tips/your-handle is yours. Photo and payout connected.',
    cta: 'Done',
    done: true,
  },
  {
    id: 'qr',
    title: 'Download & display your QR',
    body: 'Print a sticker, pin a button, drop it on Instagram bio — wherever your customers see you.',
    cta: 'Download QR →',
    done: false,
  },
  {
    id: 'share',
    title: 'Share with 5 people',
    body: "The fastest path to your first tip is telling 5 regulars about it. We'll show you how.",
    cta: 'See share kit →',
    done: false,
  },
];

// -- HELPERS -------------------------------------------------------------

/**
 * Format cents → "$2,847" (no decimals for whole dollars, two decimals when present).
 */
export function formatDollars(cents: number, opts?: { compact?: boolean }): string {
  const dollars = cents / 100;
  if (opts?.compact && dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}k`;
  }
  if (Number.isInteger(dollars)) {
    return `$${dollars.toLocaleString('en-US')}`;
  }
  return `$${dollars.toFixed(2)}`;
}

/**
 * Split cents → ['$', '2,847'] for the Money component pattern.
 */
export function splitDollars(cents: number): { sign: string; whole: string; decimal: string | null } {
  const dollars = cents / 100;
  const isWhole = Number.isInteger(dollars);
  return {
    sign: '$',
    whole: Math.floor(dollars).toLocaleString('en-US'),
    decimal: isWhole ? null : (dollars - Math.floor(dollars)).toFixed(2).slice(2),
  };
}

/**
 * Zero-out the full dataset for Day-1 zero-state preview.
 */
export function getEmptyData() {
  return {
    user: PLACEHOLDER_USER,
    stats: {
      lifetime: { amount: 0, tipCount: 0, sinceISO: '' },
      thisMonth: { amount: 0, tipCount: 0, percentVsLastMonth: 0 },
      streak: { weeks: 0, sinceLabel: '' },
      avgTip: 0,
      scannedThisWeek: 0,
    },
    appreciators: [],
    leaderboard: [],
    recentTips: [],
    achievements: PLACEHOLDER_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false })),
    benchmark: PLACEHOLDER_BENCHMARK, // category info still shown even when empty
    appDistribution: { venmo: 0, cashapp: 0, paypal: 0 },
    heatmap: Array.from({ length: 7 }, () => Array(6).fill(0)) as Heatmap,
    monthBars: Array(8).fill(0) as MiniBarSeries,
    chartSeries: [] as ChartSeries,
  };
}

/**
 * The full active-state dataset.
 */
export function getActiveData() {
  return {
    user: PLACEHOLDER_USER,
    stats: PLACEHOLDER_STATS,
    appreciators: PLACEHOLDER_APPRECIATORS,
    leaderboard: PLACEHOLDER_LEADERBOARD,
    recentTips: PLACEHOLDER_RECENT_TIPS,
    achievements: PLACEHOLDER_ACHIEVEMENTS,
    benchmark: PLACEHOLDER_BENCHMARK,
    appDistribution: PLACEHOLDER_APP_DISTRIBUTION,
    heatmap: PLACEHOLDER_HEATMAP,
    monthBars: PLACEHOLDER_MONTH_BARS,
    chartSeries: PLACEHOLDER_CHART_SERIES,
  };
}
