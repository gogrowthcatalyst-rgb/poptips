'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { INDUSTRIES } from '@/lib/industries';
import { TIERS, TIER_ORDER } from '@/lib/corp/tiers';
import type { BusinessTier } from '@/lib/db/schema';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERROR = 'text-[#B23A2E]';
const ERROR_BORDER = 'border-[#B23A2E]';

export function BusinessSignupForm({ defaultTier }: { defaultTier?: BusinessTier }) {
  const [tier, setTier] = useState<BusinessTier | ''>(defaultTier ?? '');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!tier) e.tier = 'Choose a plan';
    if (!businessName.trim()) e.businessName = 'Required';
    if (!industry) e.industry = 'Pick one';
    if (!ownerName.trim()) e.ownerName = 'Required';
    if (!EMAIL_RE.test(ownerEmail.trim())) e.ownerEmail = 'Enter a valid email';
    if (ownerPhone.replace(/\D/g, '').length < 10) e.ownerPhone = 'Enter a valid phone';
    if (!propertyName.trim()) e.propertyName = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/business/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          tier,
          industry,
          ownerName: ownerName.trim(),
          ownerEmail: ownerEmail.trim(),
          ownerPhone: ownerPhone.trim(),
          propertyName: propertyName.trim(),
          propertyAddress: propertyAddress.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok || !data?.url) {
        setErrors((x) => ({ ...x, form: data?.error ?? 'Could not start checkout.' }));
        setSubmitting(false);
        return;
      }
      window.location.href = data.url; // off to Stripe Checkout
    } catch {
      setErrors((x) => ({ ...x, form: 'Network error. Please try again.' }));
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan */}
      <fieldset>
        <legend className="mb-2 block font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim">
          Choose your plan
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {TIER_ORDER.map((t) => {
            const meta = TIERS[t];
            const active = tier === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                aria-pressed={active}
                className={cn(
                  'group relative rounded-2xl border-2 px-4 py-4 pr-11 text-left transition-all duration-200 ease-out-soft',
                  active
                    ? 'border-accent bg-accent-glow/15 shadow-lift -translate-y-0.5'
                    : 'border-line bg-paper hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lift',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200',
                    active
                      ? 'border-accent bg-accent text-paper'
                      : 'border-line bg-paper text-transparent group-hover:border-accent/50',
                  )}
                >
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-base font-medium text-ink">{meta.label}</span>
                  <span className={cn('font-mono text-sm font-medium', active ? 'text-accent' : 'text-ink')}>
                    ${meta.priceMonthly}
                    <span className="text-ink-faint">/mo</span>
                  </span>
                </div>
                <p className="mt-1 text-xs leading-snug text-ink-dim">{meta.blurb}</p>
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-ink-faint">Per location, per month. Unlimited workers. Workers are always free.</p>
        {errors.tier && <p className={cn('mt-1.5 text-xs', ERROR)}>{errors.tier}</p>}
      </fieldset>

      <Field label="Business name" error={errors.businessName} htmlFor="businessName">
        <TextInput id="businessName" value={businessName} onChange={setBusinessName} invalid={!!errors.businessName} placeholder="Marea Hospitality Group" />
      </Field>

      <Field label="Industry" error={errors.industry} htmlFor="industry" hint="Seeds your staff role list">
        <select
          id="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className={cn(
            'w-full cursor-pointer rounded-xl border-2 bg-paper px-4 py-3 text-base outline-none transition-colors focus:border-accent',
            errors.industry ? ERROR_BORDER : 'border-line',
            industry === '' ? 'text-ink-faint' : 'text-ink',
          )}
        >
          <option value="" disabled>Select…</option>
          {INDUSTRIES.map((opt) => (
            <option key={opt.slug} value={opt.slug} className="text-ink">{opt.label}</option>
          ))}
        </select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" error={errors.ownerName} htmlFor="ownerName" hint="Account owner">
          <TextInput id="ownerName" value={ownerName} onChange={setOwnerName} invalid={!!errors.ownerName} autoComplete="name" />
        </Field>
        <Field label="Your phone" error={errors.ownerPhone} htmlFor="ownerPhone" hint="For your secure admin link">
          <TextInput id="ownerPhone" value={ownerPhone} onChange={setOwnerPhone} invalid={!!errors.ownerPhone} type="tel" inputMode="tel" autoComplete="tel" placeholder="(941) 555-0123" />
        </Field>
      </div>

      <Field label="Your email" error={errors.ownerEmail} htmlFor="ownerEmail">
        <TextInput id="ownerEmail" value={ownerEmail} onChange={setOwnerEmail} invalid={!!errors.ownerEmail} type="email" inputMode="email" autoComplete="email" placeholder="owner@business.com" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First location name" error={errors.propertyName} htmlFor="propertyName" hint="You can add more later">
          <TextInput id="propertyName" value={propertyName} onChange={setPropertyName} invalid={!!errors.propertyName} placeholder="The Sarasota Resort" />
        </Field>
        <Field label="Location address" htmlFor="propertyAddress" hint="Optional">
          <TextInput id="propertyAddress" value={propertyAddress} onChange={setPropertyAddress} placeholder="1 Beach Rd, Sarasota FL" />
        </Field>
      </div>

      {errors.form && (
        <p className={cn('rounded-xl border px-4 py-3 text-sm', ERROR, ERROR_BORDER)}>{errors.form}</p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="flex w-full items-center justify-center rounded-full bg-accent px-8 py-3.5 font-display text-lg font-medium text-paper shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-accent-dim active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Starting checkout…' : 'Continue to payment →'}
      </button>
      <p className="text-center text-xs text-ink-faint">
        Secure checkout by Stripe. You&rsquo;ll add a card to start your subscription.
      </p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>}
      {error && <p className={cn('mt-1.5 text-xs', ERROR)}>{error}</p>}
    </div>
  );
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
  invalid,
  type = 'text',
  autoComplete,
  inputMode,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  invalid?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
}) {
  return (
    <input
      id={id}
      type={type}
      autoComplete={autoComplete}
      inputMode={inputMode}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full rounded-xl border-2 bg-paper px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent',
        invalid ? ERROR_BORDER : 'border-line',
      )}
    />
  );
}
