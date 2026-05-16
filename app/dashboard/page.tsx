'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { TrackForcer } from '@/components/TrackForcer';
import { Reveal } from '@/components/Reveal';
import { getActiveData, getEmptyData } from '@/lib/dashboard/placeholder-data';

import { LifetimeCard, ThisMonthCard, StreakCard } from '@/components/dashboard/StatCards';
import { QrCard } from '@/components/dashboard/QrCard';
import { TipsChart } from '@/components/dashboard/TipsChart';
import {
  CategoryBenchmark,
  AppDistribution,
  TimeHeatmap,
} from '@/components/dashboard/BenchmarkCards';
import { TopAppreciators, Leaderboard } from '@/components/dashboard/Community';
import {
  ShareMilestone,
  Achievements,
  RecentTips,
} from '@/components/dashboard/Engagement';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';

function DashboardInner() {
  const searchParams = useSearchParams();
  const isEmpty = searchParams.get('empty') === '1';
  const data = isEmpty ? getEmptyData() : getActiveData();

  const {
    user,
    stats,
    appreciators,
    leaderboard,
    recentTips,
    achievements,
    benchmark,
    appDistribution,
    heatmap,
    monthBars,
    chartSeries,
  } = data;

  // Show the share-milestone strip only when active AND user crossed a threshold
  const showMilestone = !isEmpty && stats.lifetime.amount >= 250000;

  return (
    <main className="mx-auto max-w-[1400px] px-5 pb-20 pt-10 md:px-8 md:pt-12">
      {/* WELCOME ============================================ */}
      <Reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 font-mono text-xs font-medium uppercase tracking-wider2 text-jade-700">
              Your dashboard
            </p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tightest text-ink md:text-5xl">
              {isEmpty ? (
                <>
                  Welcome, <em className="italic text-jade-500">{user.firstName}.</em>
                </>
              ) : (
                <>
                  Welcome back, <em className="italic text-jade-500">{user.firstName}.</em>
                </>
              )}
            </h1>
            <p className="mt-1.5 text-sm text-ink-dim md:text-base">
              {isEmpty ? (
                'Your tipping page is ready. Now let\u2019s get you tips.'
              ) : (
                <>
                  {user.role} · {user.establishment} ·{' '}
                  {stats.streak.weeks > 0 && (
                    <>{stats.streak.weeks}-week streak going strong.</>
                  )}
                </>
              )}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-jade-100 bg-gradient-to-br from-jade-50 to-paper px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wider2 text-jade-700">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-jade-500" />
            {isEmpty
              ? 'Setup mode · 1 of 3 steps done'
              : 'Tips arriving directly · 100% to you'}
          </span>
        </div>
      </Reveal>

      {/* ONBOARDING CHECKLIST — zero state only ============= */}
      {isEmpty && (
        <Reveal delay={80}>
          <div className="mb-6">
            <OnboardingChecklist />
          </div>
        </Reveal>
      )}

      {/* HERO STATS ROW ===================================== */}
      <Reveal delay={isEmpty ? 160 : 80}>
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <LifetimeCard
              amountCents={stats.lifetime.amount}
              tipCount={stats.lifetime.tipCount}
              sinceISO={stats.lifetime.sinceISO}
              sparkline={chartSeries}
            />
          </div>
          <div className="md:col-span-1">
            <ThisMonthCard
              amountCents={stats.thisMonth.amount}
              tipCount={stats.thisMonth.tipCount}
              percentVsLastMonth={stats.thisMonth.percentVsLastMonth}
              bars={monthBars}
            />
          </div>
          <div className="md:col-span-1">
            <StreakCard weeks={stats.streak.weeks} sinceLabel={stats.streak.sinceLabel} />
          </div>
        </div>
      </Reveal>

      {/* QR + TIPS-OVER-TIME =============================== */}
      <Reveal delay={120}>
        <div className="mb-4 grid gap-4 md:grid-cols-[1fr_1.7fr]">
          <QrCard handle={user.handle} scannedThisWeek={stats.scannedThisWeek} />
          <TipsChart series={chartSeries} />
        </div>
      </Reveal>

      {/* THREE-CARD ROW ==================================== */}
      <Reveal delay={160}>
        <div className="mb-4 grid gap-4 md:grid-cols-[1.3fr_1fr_1fr]">
          <CategoryBenchmark data={benchmark} />
          <AppDistribution data={appDistribution} />
          <TimeHeatmap data={heatmap} />
        </div>
      </Reveal>

      {/* COMMUNITY ROW ===================================== */}
      <Reveal delay={200}>
        <div className="mb-4 grid gap-4 md:grid-cols-[1fr_1.2fr]">
          <TopAppreciators appreciators={appreciators} />
          <Leaderboard entries={leaderboard} />
        </div>
      </Reveal>

      {/* SHARE MILESTONE — when active and crossed threshold */}
      {showMilestone && (
        <Reveal delay={240}>
          <div className="mb-4">
            <ShareMilestone
              milestone="$2,500 lifetime"
              description="Share the moment. A one-tap card for Instagram Stories, ready to post — your numbers, your story."
            />
          </div>
        </Reveal>
      )}

      {/* ACHIEVEMENTS ====================================== */}
      <Reveal delay={280}>
        <div className="mb-4">
          <Achievements achievements={achievements} />
        </div>
      </Reveal>

      {/* RECENT TIPS FEED ================================== */}
      <Reveal delay={320}>
        <div className="mb-4">
          <RecentTips tips={recentTips} />
        </div>
      </Reveal>

      {/* Dev-mode pill — quick toggle between empty and active states */}
      <div className="mt-12 flex justify-center">
        <a
          href={isEmpty ? '/dashboard' : '/dashboard?empty=1'}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 font-mono text-[10px] uppercase tracking-wider2 text-ink-dim transition-colors hover:border-ink hover:text-ink"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
          Preview: {isEmpty ? 'Active dashboard' : 'Zero state'}
        </a>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <>
      <TrackForcer track="recipient" />
      <Suspense fallback={<div className="min-h-screen" />}>
        <DashboardInner />
      </Suspense>
    </>
  );
}
