'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/cn';
import { PAYMENT_APP_ORDER, PAYMENT_APP_META } from '@/lib/payment-apps';
import type { PaymentApp } from '@/lib/payment-apps';
import { INDUSTRIES, OTHER_SLUG } from '@/lib/industries';

type Role = 'tipper' | 'recipient';

export interface AccountInitial {
  role: Role;
  firstName: string;
  lastName: string;
  homeZip: string;
  primaryIndustry: string;
  industryOther: string;
  birthYear: string;
  // recipient-only
  photoUrl?: string | null;
  serviceRole?: string;
  message?: string;
  workplaceName?: string;
  workplaceAddress?: string;
  workplacePhone?: string;
  // tipper-only
  usesApps?: PaymentApp[];
}

const ZIP_RE = /^\d{5}(-\d{4})?$/;
const NOW_YEAR = new Date().getFullYear();
const MIN_BIRTH_YEAR = NOW_YEAR - 120;
const MAX_BIRTH_YEAR = NOW_YEAR - 18;
const ERROR = 'text-[#B23A2E]';
const ERROR_BORDER = 'border-[#B23A2E]';

export function AccountForm({ initial }: { initial: AccountInitial }) {
  const isRecipient = initial.role === 'recipient';

  const [firstName, setFirstName] = useState(initial.firstName ?? '');
  const [lastName, setLastName] = useState(initial.lastName ?? '');
  const [zip, setZip] = useState(initial.homeZip ?? '');
  const [birthYear, setBirthYear] = useState(initial.birthYear ?? '');
  const [industry, setIndustry] = useState(initial.primaryIndustry ?? '');
  const [industryOther, setIndustryOther] = useState(initial.industryOther ?? '');

  const [serviceRole, setServiceRole] = useState(initial.serviceRole ?? '');
  const [message, setMessage] = useState(initial.message ?? '');
  const [workplaceName, setWorkplaceName] = useState(initial.workplaceName ?? '');
  const [workplaceAddress, setWorkplaceAddress] = useState(initial.workplaceAddress ?? '');
  const [workplacePhone, setWorkplacePhone] = useState(initial.workplacePhone ?? '');

  const [usesApps, setUsesApps] = useState<PaymentApp[]>(initial.usesApps ?? []);

  const [photoUrl, setPhotoUrl] = useState<string | null>(initial.photoUrl ?? null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isOther = industry === OTHER_SLUG;

  const toggleApp = (app: PaymentApp) => {
    setUsesApps((prev) => (prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app]));
  };

  const onPickPhoto = async (file: File) => {
    setPhotoBusy(true);
    setErrors((e) => ({ ...e, photo: '' }));
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload/photo', { method: 'POST', body: fd });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; url?: string; error?: string } | null;
      if (!res.ok || !data?.ok || !data.url) {
        setErrors((e) => ({ ...e, photo: data?.error ?? 'Upload failed.' }));
      } else {
        setPhotoUrl(data.url); // URL is unique per upload — no stale cache
      }
    } catch {
      setErrors((e) => ({ ...e, photo: 'Network error during upload.' }));
    } finally {
      setPhotoBusy(false);
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = 'Required';
    if (!lastName.trim()) next.lastName = 'Required';
    if (!ZIP_RE.test(zip.trim())) next.zip = 'Enter a 5-digit ZIP';
    if (birthYear.trim()) {
      const by = parseInt(birthYear, 10);
      if (!/^\d{4}$/.test(birthYear.trim()) || by < MIN_BIRTH_YEAR || by > MAX_BIRTH_YEAR) {
        next.birthYear = 'Enter a valid year — you must be 18+';
      }
    }
    if (!industry) next.industry = 'Pick one';
    else if (isOther && !industryOther.trim()) next.industryOther = 'Tell us the industry';
    if (isRecipient && !workplaceName.trim()) next.workplaceName = 'Required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSave = async () => {
    if (saving) return;
    setSaved(false);
    if (!validate()) return;
    setSaving(true);

    const common = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      homeZip: zip.trim(),
      primaryIndustry: industry,
      ...(birthYear.trim() ? { birthYear: parseInt(birthYear, 10) } : {}),
      ...(isOther ? { industryOther: industryOther.trim() } : {}),
    };

    const body = isRecipient
      ? {
          role: 'recipient' as const,
          ...common,
          serviceRole: serviceRole.trim() || null,
          message: message.trim() || null,
          workplaceName: workplaceName.trim(),
          workplaceAddress: workplaceAddress.trim() || null,
          workplacePhone: workplacePhone.trim() || null,
        }
      : {
          role: 'tipper' as const,
          ...common,
          usesApps,
        };

    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setErrors((e) => ({ ...e, form: data?.error ?? 'Could not save.' }));
      } else {
        setSaved(true);
      }
    } catch {
      setErrors((e) => ({ ...e, form: 'Network error. Please try again.' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Photo (recipient only) */}
      {isRecipient && (
        <div>
          <p className="mb-2 block font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim">
            Photo
          </p>
          <div className="flex items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-line bg-surface">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="Your photo" className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-2xl font-medium italic text-accent">
                  {(firstName || '?').charAt(0)}
                </span>
              )}
            </div>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onPickPhoto(f);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                disabled={photoBusy}
                onClick={() => fileRef.current?.click()}
                className="rounded-full border-2 border-line bg-paper px-5 py-2.5 font-display text-sm font-medium text-ink transition-colors hover:border-accent disabled:opacity-60"
              >
                {photoBusy ? 'Uploading…' : photoUrl ? 'Change photo' : 'Add a photo'}
              </button>
              {errors.photo && <p className={cn('mt-1.5 text-xs', ERROR)}>{errors.photo}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Name */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" error={errors.firstName} htmlFor="firstName">
          <TextInput id="firstName" value={firstName} onChange={setFirstName} invalid={!!errors.firstName} autoComplete="given-name" />
        </Field>
        <Field label="Last name" error={errors.lastName} htmlFor="lastName">
          <TextInput id="lastName" value={lastName} onChange={setLastName} invalid={!!errors.lastName} autoComplete="family-name" />
        </Field>
      </div>

      {/* ZIP + Birth year */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Home ZIP" error={errors.zip} htmlFor="zip" hint="Regional insights">
          <TextInput
            id="zip"
            value={zip}
            onChange={(v) => setZip(v.replace(/[^\d-]/g, '').slice(0, 10))}
            invalid={!!errors.zip}
            inputMode="numeric"
            autoComplete="postal-code"
          />
        </Field>
        <Field
          label="Birth year"
          error={errors.birthYear}
          htmlFor="birthYear"
          hint="Be honest, now — just for your age-group stats"
        >
          <TextInput
            id="birthYear"
            value={birthYear}
            onChange={(v) => setBirthYear(v.replace(/\D/g, '').slice(0, 4))}
            invalid={!!errors.birthYear}
            inputMode="numeric"
            placeholder={String(MAX_BIRTH_YEAR - 12)}
          />
        </Field>
      </div>

      {/* Industry */}
      <Field
        label={isRecipient ? 'Your industry' : 'What do you tip most?'}
        error={errors.industry}
        htmlFor="industry"
        hint={isRecipient ? 'The kind of place you work' : 'Where you tip most often'}
      >
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
          <option value="" disabled>
            Select…
          </option>
          {INDUSTRIES.map((opt) => (
            <option key={opt.slug} value={opt.slug} className="text-ink">
              {opt.label}
            </option>
          ))}
        </select>
      </Field>

      {isOther && (
        <Field label="Which industry?" error={errors.industryOther} htmlFor="industryOther">
          <TextInput id="industryOther" value={industryOther} onChange={setIndustryOther} invalid={!!errors.industryOther} placeholder="e.g. Pet grooming" />
        </Field>
      )}

      {/* Recipient-only: service role, workplace, message */}
      {isRecipient && (
        <>
          <Field label="Your role" htmlFor="serviceRole" hint="e.g. Barista, Server, Stylist">
            <TextInput id="serviceRole" value={serviceRole} onChange={setServiceRole} placeholder="Barista" />
          </Field>

          <Field label="Where you work" error={errors.workplaceName} htmlFor="workplaceName" hint="Business name">
            <TextInput id="workplaceName" value={workplaceName} onChange={setWorkplaceName} invalid={!!errors.workplaceName} autoComplete="organization" />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Workplace address" htmlFor="workplaceAddress" hint="Optional">
              <TextInput id="workplaceAddress" value={workplaceAddress} onChange={setWorkplaceAddress} placeholder="123 Main St, Sarasota FL" />
            </Field>
            <Field label="Workplace phone" htmlFor="workplacePhone" hint="Optional">
              <TextInput id="workplacePhone" value={workplacePhone} onChange={setWorkplacePhone} type="tel" inputMode="tel" placeholder="(941) 555-0123" />
            </Field>
          </div>

          <Field label="Your message" htmlFor="message" hint="Shown on your tip page (optional)">
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 280))}
              rows={3}
              placeholder="Thanks so much for stopping by!"
              className="w-full rounded-xl border-2 border-line bg-paper px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
            />
          </Field>
        </>
      )}

      {/* Tipper-only: apps */}
      {!isRecipient && (
        <fieldset>
          <legend className="mb-2 block font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim">
            Which apps do you use?
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_APP_ORDER.map((app) => {
              const active = usesApps.includes(app);
              return (
                <button
                  key={app}
                  type="button"
                  onClick={() => toggleApp(app)}
                  className={cn(
                    'rounded-xl border-2 px-3 py-3 text-center font-display text-sm font-medium transition-all duration-200 active:scale-95',
                    active ? 'border-accent bg-accent-glow/20 text-ink shadow-lift' : 'border-line bg-paper text-ink-dim hover:border-accent',
                  )}
                  aria-pressed={active}
                >
                  {PAYMENT_APP_META[app].label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Secured edits live elsewhere — set expectation, don't dead-end */}
      <p className="rounded-xl border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-faint">
        {isRecipient ? (
          <>Your <span className="font-medium text-ink-dim">handle</span> and your <span className="font-medium text-ink-dim">payout apps</span> are changed through a secured, text-verified flow — coming next.</>
        ) : (
          <>Your email and phone are your sign-in identity and aren&rsquo;t edited here.</>
        )}
      </p>

      {errors.form && (
        <p className={cn('rounded-xl border px-4 py-3 text-sm', ERROR, ERROR_BORDER)}>{errors.form}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center justify-center rounded-full bg-accent px-8 py-3.5 font-display text-lg font-medium text-paper shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-accent-dim active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span className="font-mono text-xs uppercase tracking-wider2 text-jade-700">✓ Saved</span>}
      </div>
    </div>
  );
}

/* ── primitives (match SignupForm) ─────────────────────────────────── */

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
  inputMode?: 'text' | 'tel' | 'email' | 'numeric' | 'decimal';
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
