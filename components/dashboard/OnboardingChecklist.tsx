'use client';

import { ONBOARDING_STEPS } from '@/lib/dashboard/placeholder-data';

/**
 * Onboarding checklist — Day-1 zero-state hero.
 *
 * Three steps to first tip: profile claimed → display QR → share with 5
 * people. Steps marked `done: true` render in jade with a checkmark;
 * pending steps render with a numbered circle and a CTA.
 */
export function OnboardingChecklist() {
  const done = ONBOARDING_STEPS.filter((s) => s.done).length;
  const total = ONBOARDING_STEPS.length;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-jade-100 bg-gradient-to-br from-jade-50 via-paper to-paper p-7 shadow-lift md:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-gold-100 opacity-40 blur-3xl"
      />
      <div className="relative">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 font-mono text-xs font-medium uppercase tracking-wider2 text-jade-700">
              Get your first tip
            </p>
            <h2 className="font-display text-3xl font-medium leading-tight tracking-tightest text-ink md:text-4xl">
              Three steps to <em className="italic text-jade-500">launch.</em>
            </h2>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider2 text-ink-dim">
            <strong className="font-semibold text-jade-500">{done}</strong> of {total} complete
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {ONBOARDING_STEPS.map((step, i) => (
            <div
              key={step.id}
              className={`relative flex flex-col gap-2 rounded-2xl border p-5 ${
                step.done
                  ? 'border-jade-100 bg-gradient-to-br from-jade-50 to-paper'
                  : 'border-line-soft bg-paper'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] font-mono text-xs font-semibold ${
                  step.done
                    ? 'border-jade-500 bg-jade-500 text-paper'
                    : 'border-line bg-paper text-ink-faint'
                }`}
              >
                {step.done ? '✓' : i + 1}
              </div>
              <h4 className="font-display text-lg font-medium italic text-ink">
                {step.title}
              </h4>
              <p className="text-sm leading-relaxed text-ink-dim">{step.body}</p>
              <a
                href="#"
                className={`mt-auto self-start font-mono text-[10px] font-medium uppercase tracking-wider2 transition-colors ${
                  step.done
                    ? 'text-ink-faint'
                    : 'text-jade-700 hover:text-jade-500'
                }`}
              >
                {step.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
