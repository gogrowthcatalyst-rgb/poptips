'use client';

import { TIPPER_ONBOARDING_STEPS } from '@/lib/dashboard/tipper-data';
import { Check } from '@/components/icons';

/**
 * Tipper Day-1 onboarding hero. Three steps to first tip + saved regulars:
 *   1. Profile claimed (done at signup)
 *   2. Send your first tip (how-to-scan)
 *   3. Save your regulars
 *
 * Replaces the stat hero when the tipper has no tip history. Same visual
 * treatment as the recipient onboarding for consistency.
 */
export function TipperOnboardingChecklist() {
  const done = TIPPER_ONBOARDING_STEPS.filter((s) => s.done).length;
  const total = TIPPER_ONBOARDING_STEPS.length;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-coral-100 bg-gradient-to-br from-coral-50 via-paper to-paper p-7 shadow-lift md:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-gold-100 opacity-40 blur-3xl"
      />
      <div className="relative">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 font-mono text-xs font-medium uppercase tracking-wider2 text-coral-700">
              Send your first tip
            </p>
            <h2 className="font-display text-3xl font-medium leading-tight tracking-tightest text-ink md:text-4xl">
              Three steps to start <em className="italic text-coral-500">appreciating.</em>
            </h2>
          </div>
          <span className="font-mono text-xs uppercase tracking-wider2 text-ink-dim">
            <strong className="font-semibold text-coral-500">{done}</strong> of {total} complete
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TIPPER_ONBOARDING_STEPS.map((step, i) => (
            <div
              key={step.id}
              className={`relative flex flex-col gap-2 rounded-2xl border p-5 ${
                step.done
                  ? 'border-coral-100 bg-gradient-to-br from-coral-50 to-paper'
                  : 'border-line-soft bg-paper'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] font-mono text-xs font-semibold ${
                  step.done
                    ? 'border-coral-500 bg-coral-500 text-paper'
                    : 'border-line bg-paper text-ink-faint'
                }`}
              >
                {step.done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : i + 1}
              </div>
              <h4 className="font-display text-lg font-medium italic text-ink">{step.title}</h4>
              <p className="text-sm leading-relaxed text-ink-dim">{step.body}</p>
              <a
                href="#"
                className={`mt-auto self-start font-mono text-[10px] font-medium uppercase tracking-wider2 transition-colors ${
                  step.done ? 'text-ink-faint' : 'text-coral-700 hover:text-coral-500'
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
