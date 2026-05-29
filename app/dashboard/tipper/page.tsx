'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { TrackForcer } from '@/components/TrackForcer';
import { Reveal } from '@/components/Reveal';
import {
  getActiveTipperData,
  getEmptyTipperData,
} from '@/lib/dashboard/tipper-data';

import {
  LifetimeGivenCard,
  ThisMonthGivenCard,
  TipperAppreciationStreakCard,
} from '@/components/dashboard/TipperStatCards';
import { QuickTipCard } from '@/components/dashboard/QuickTipCard';
import { TipsChart } from '@/components/dashboard/TipsChart';
import { AgeBenchmark } from '@/components/dashboard/AgeBenchmark';
import {
  AppDistribution,
  TimeHeatmap,
} from '@/components/dashboard/BenchmarkCards';
import {
  TopRecipients,
  TipperLeaderboard,
} from '@/components/dashboard/TipperCommunity';
import { AppreciationMap } from '@/components/dashboard/AppreciationMap';
import {
  TipperShareMilestone,
  TipperAchievements,
  RecentSentTips,
} from '@/components/dashboard/TipperEngagement';
import { TipperOnboardingChecklist } from '@/components/dashboard/TipperOnboardingChecklist';
import { AccountLink } from '@/components/DashboardHeader';

function TipperDashboardInner() {
  const searchParams = useSearchParams();
  const isEmpty = searchParams.get('empty') === '1';
  const data = isEmpty ? getEmptyTipperData() : getActiveTipperData();

  const {
    user,
    stats,
    topRecipients,
    regulars,
    sentTips,
    achievements,
    ageBenchmark,
    appDistribution,
    heatmap,
    monthBars,
    chartSeries,
    mapPins,
    leaderboard,
  } = data;

  // Milestone trigger — tipper gets a share moment when they've appreciated
  // a meaningful number of unique workers (Pete's "Tipped 50 different people" framing)
  const showMilestone = !isEmpty && stats.lifetime.uniqueRecipients >= 40;

  return (
    <main className="mx-auto max-w-[1400px] px-5 pb-20 pt-10 md:px-8 md:pt-12">
      {/* WELCOME ============================================ */}
      <Reveal>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 font-mono text-xs font-medium uppercase tracking-wider2 text-coral-700">
              Your tipper dashboard
            </p>
            <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tightest text-ink md:text-5xl">
              {isEmpty ? (
                <>
                  Welcome, <em className="italic text-coral-500">{user.firstName}.</em>
                </>
              ) : (
                <>
                  Welcome back, <em className="italic text-coral-500">{user.firstName}.</em>
                </>
              )}
            </h1>
            <p className="mt-1.5 text-sm text-ink-dim md:text-base">
              {isEmpty ? (
                'Your tipper account is ready. Now go appreciate someone.'
              ) : (
                <>
                  {user.neighborhood && <>{user.neighborhood} &middot; </>}
                  {user.city}, {user.region}
                  {stats.streak.weeks > 0 && (
                    <> &middot; {stats.streak.weeks}-week appreciation streak.</>
                  )}
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-coral-100 bg-gradient-to-br from-coral-50 to-paper px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wider2 text-coral-700">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-coral-500" />
              {isEmpty
                ? 'Setup mode · 1 of 3 steps done'
                : 'One-to-one tipping, directly'}
            </span>
            <AccountLink />
          </div>
        </div>
      </Reveal>

      {/* ONBOARDING — zero state only ====================== */}
      {isEmpty && (
        <Reveal delay={80}>
          <div className="mb-6">
            <TipperOnboardingChecklist />
          </div>
        </Reveal>
      )}

      {/* HERO STATS ROW ===================================== */}
      <Reveal delay={isEmpty ? 160 : 80}>
        <div className="mb-4 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1">
            <LifetimeGivenCard
              amountCents={stats.lifetime.amount}
              tipCount={stats.lifetime.tipCount}
              uniqueRecipients={stats.lifetime.uniqueRecipients}
              sinceISO={stats.lifetime.sinceISO}
              sparkline={chartSeries}
            />
          </div>
          <div className="md:col-span-1">
            <ThisMonthGivenCard
              amountCents={stats.thisMonth.amount}
              tipCount={stats.thisMonth.tipCount}
              percentVsLastMonth={stats.thisMonth.percentVsLastMonth}
              bars={monthBars}
            />
          </div>
          <div className="md:col-span-1">
            <TipperAppreciationStreakCard
              weeks={stats.streak.weeks}
              sinceLabel={stats.streak.sinceLabel}
            />
          </div>
        </div>
      </Reveal>

      {/* QUICK-TIP + TIPS-OVER-TIME ======================== */}
      <Reveal delay={120}>
        <div className="mb-4 grid gap-4 md:grid-cols-[1fr_1.7fr]">
          <QuickTipCard regulars={regulars} />
          <TipsChart series={chartSeries} />
        </div>
      </Reveal>

      {/* THREE-CARD ROW ==================================== */}
      <Reveal delay={160}>
        <div className="mb-4 grid gap-4 md:grid-cols-[1.3fr_1fr_1fr]">
          <AgeBenchmark data={ageBenchmark} />
          <AppDistribution data={appDistribution} />
          <TimeHeatmap data={heatmap} />
        </div>
      </Reveal>

      {/* COMMUNITY ROW ===================================== */}
      <Reveal delay={200}>
        <div className="mb-4 grid gap-4 md:grid-cols-[1fr_1.2fr]">
          <TopRecipients recipients={topRecipients} />
          <TipperLeaderboard entries={leaderboard} />
        </div>
      </Reveal>

      {/* APPRECIATION MAP — full width =================== */}
      <Reveal delay={240}>
        <div className="mb-4">
          <AppreciationMap pins={mapPins} />
        </div>
      </Reveal>

      {/* SHARE MILESTONE — when threshold crossed ========== */}
      {showMilestone && (
        <Reveal delay={280}>
          <div className="mb-4">
            <TipperShareMilestone
              milestone={`appreciated ${stats.lifetime.uniqueRecipients} unique workers`}
              description="That&rsquo;s real money going to real people who earned it. Share the moment with a card built for Instagram Stories."
            />
          </div>
        </Reveal>
      )}

      {/* ACHIEVEMENTS ====================================== */}
      <Reveal delay={320}>
        <div className="mb-4">
          <TipperAchievements achievements={achievements} />
        </div>
      </Reveal>

      {/* RECENT SENT TIPS FEED ============================= */}
      <Reveal delay={360}>
        <div className="mb-4">
          <RecentSentTips tips={sentTips} />
        </div>
      </Reveal>

      {/* Dev-mode toggle =================================== */}
      <div className="mt-12 flex justify-center">
        <a
          href={isEmpty ? '/dashboard/tipper' : '/dashboard/tipper?empty=1'}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 font-mono text-[10px] uppercase tracking-wider2 text-ink-dim transition-colors hover:border-ink hover:text-ink"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
          Preview: {isEmpty ? 'Active dashboard' : 'Zero state'}
        </a>
      </div>
    </main>
  );
}

export default function TipperDashboardPage() {
  return (
    <>
      <TrackForcer track="tipper" />
      <Suspense fallback={<div className="min-h-screen" />}>
        <TipperDashboardInner />
      </Suspense>
    </>
  );
}
