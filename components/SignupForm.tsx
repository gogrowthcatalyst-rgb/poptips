'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { track } from '@/lib/analytics';
import { PAYMENT_APP_ORDER, PAYMENT_APP_META } from '@/lib/payment-apps';
import type { PaymentApp } from '@/lib/payment-apps';

type Role = 'tipper' | 'recipient';

interface Props {
  role: Role;
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  handle?: string;
  smsConsent?: string;
  form?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERROR = 'text-[#B23A2E]';
const ERROR_BORDER = 'border-[#B23A2E]';

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

export function SignupForm({ role }: Props) {
  const isRecipient = role === 'recipient';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [usesApps, setUsesApps] = useState<PaymentApp[]>([]);
  const [smsConsent, setSmsConsent] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { handle?: string }>(null);

  // Live handle availability (recipient only)
  const [handleState, setHandleState] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const [handleReason, setHandleReason] = useState<string>('');
  const debounceRef = useRef<number | null>(null);

  const checkHandleAvailability = useCallback((value: string) => {
    const h = value.trim().toLowerCase();
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (h.length < 2) {
      setHandleState('idle');
      setHandleReason('');
      return;
    }
    setHandleState('checking');
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/handle-check?handle=${encodeURIComponent(h)}`);
        const data = (await res.json()) as { available: boolean; reason?: string };
        if (data.available) {
          setHandleState('available');
          setHandleReason('');
        } else {
          setHandleState('taken');
          setHandleReason(data.reason ?? 'Not available.');
        }
      } catch {
        setHandleState('idle');
        setHandleReason('');
      }
    }, 400);
  }, []);

  const onHandleChange = (value: string) => {
    // Normalize as the user types: lowercase, strip spaces/illegal chars softly.
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
    setHandle(cleaned);
    checkHandleAvailability(cleaned);
  };

  const toggleApp = (app: PaymentApp) => {
    setUsesApps((prev) =>
      prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app],
    );
  };

  /** Validate all fields at the boundary. Returns true if valid. */
  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = 'Required';
    if (!lastName.trim()) next.lastName = 'Required';
    if (digitsOnly(phone).length < 10) next.phone = 'Enter a valid phone number';
    if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email';
    if (isRecipient) {
      if (handle.trim().length < 2) next.handle = 'Pick a handle';
      else if (handleState === 'taken') next.handle = handleReason || 'Not available';
    }
    if (!smsConsent) next.smsConsent = 'Please consent to receive your magic link by text.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    setErrors((e) => ({ ...e, form: undefined }));

    const payload =
      role === 'recipient'
        ? {
            role,
            handle: handle.trim().toLowerCase(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            smsConsent: true as const,
          }
        : {
            role,
            usesApps,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            smsConsent: true as const,
          };

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; handle?: string; error?: string; field?: string }
        | null;

      if (!res.ok || !data?.ok) {
        if (data?.field === 'handle' && data.error) {
          setErrors((e) => ({ ...e, handle: data.error }));
          setHandleState('taken');
        } else {
          setErrors((e) => ({ ...e, form: data?.error ?? 'Something went wrong. Please try again.' }));
        }
        setSubmitting(false);
        return;
      }

      track('signup_completed', { role });
      setDone({ handle: data.handle });
    } catch {
      setErrors((e) => ({ ...e, form: 'Network error. Please try again.' }));
      setSubmitting(false);
    }
  };

  /* ── SUCCESS STATE ─────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-paper px-6 py-10 text-center md:px-10 md:py-12">
        <div
          aria-hidden
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-glow text-2xl"
        >
          ✦
        </div>
        <h3 className="font-display text-2xl font-medium italic text-ink">
          Check your phone.
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-ink-dim">
          We just texted a magic link to{' '}
          <span className="font-medium text-ink">{phone}</span>. Tap it to confirm
          your account — no password needed.
        </p>
        {isRecipient && done.handle && (
          <p className="mt-5 inline-flex items-baseline gap-1 rounded-xl bg-surface px-4 py-3 font-mono text-sm text-ink-faint">
            <span>pop.tips/</span>
            <span className="font-medium text-accent">{done.handle}</span>
          </p>
        )}
        <p className="mt-6 text-xs leading-relaxed text-ink-faint">
          Didn&rsquo;t get it? Check that your number is correct, or wait a moment —
          texts can take up to a minute.
        </p>
      </div>
    );
  }

  /* ── FORM ──────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      {/* Recipient: handle claim — the headline action */}
      {isRecipient && (
        <Field label="Claim your handle" error={errors.handle} htmlFor="handle">
          <div
            className={cn(
              'flex items-center gap-1 rounded-xl border-2 bg-paper px-4 py-3 transition-colors focus-within:border-accent',
              errors.handle ? ERROR_BORDER : 'border-line',
            )}
          >
            <span className="font-mono text-sm text-ink-faint">pop.tips/</span>
            <input
              id="handle"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="your-handle"
              value={handle}
              onChange={(e) => onHandleChange(e.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent font-mono text-sm font-medium text-ink outline-none placeholder:text-ink-faint"
            />
            {handleState === 'checking' && (
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider2 text-ink-faint">
                Checking…
              </span>
            )}
            {handleState === 'available' && (
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider2 text-jade-700">
                ✓ Available
              </span>
            )}
            {handleState === 'taken' && (
              <span className={cn('shrink-0 font-mono text-[10px] uppercase tracking-wider2', ERROR)}>
                Taken
              </span>
            )}
          </div>
        </Field>
      )}

      {/* Name row */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" error={errors.firstName} htmlFor="firstName">
          <TextInput
            id="firstName"
            value={firstName}
            onChange={setFirstName}
            placeholder="Pete"
            invalid={!!errors.firstName}
            autoComplete="given-name"
          />
        </Field>
        <Field label="Last name" error={errors.lastName} htmlFor="lastName">
          <TextInput
            id="lastName"
            value={lastName}
            onChange={setLastName}
            placeholder="Zeiner"
            invalid={!!errors.lastName}
            autoComplete="family-name"
          />
        </Field>
      </div>

      {/* Phone */}
      <Field label="Phone" error={errors.phone} htmlFor="phone" hint="For your magic link by text">
        <TextInput
          id="phone"
          value={phone}
          onChange={setPhone}
          placeholder="(555) 000-0000"
          invalid={!!errors.phone}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
        />
      </Field>

      {/* Email */}
      <Field label="Email" error={errors.email} htmlFor="email">
        <TextInput
          id="email"
          value={email}
          onChange={setEmail}
          placeholder="pete@example.com"
          invalid={!!errors.email}
          type="email"
          autoComplete="email"
          inputMode="email"
        />
      </Field>

      {/* Tipper: which apps do you use */}
      {!isRecipient && (
        <fieldset>
          <legend className="mb-2 block font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim">
            Which apps do you use?
          </legend>
          <p className="mb-3 text-xs leading-relaxed text-ink-faint">
            Pop Tips works best when you have all three — that way you can tip
            anyone, instantly, without downloading anything in the moment.
          </p>
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
                    active
                      ? 'border-accent bg-accent-glow/20 text-ink shadow-lift'
                      : 'border-line bg-paper text-ink-dim hover:border-accent',
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

      {/* SMS consent */}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={smsConsent}
          onChange={(e) => setSmsConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[color:var(--accent)]"
        />
        <span className="text-xs leading-relaxed text-ink-dim">
          I consent to receive non-marketing text messages from{' '}
          <strong className="font-medium text-ink">Pop Tips</strong> about my account
          (including my magic link). Message frequency varies; message &amp; data rates
          may apply. Text HELP for help, STOP to opt out.
        </span>
      </label>
      {errors.smsConsent && <p className={cn('text-xs', ERROR)}>{errors.smsConsent}</p>}

      {/* Form-level error */}
      {errors.form && (
        <p className={cn('rounded-xl border px-4 py-3 text-sm', ERROR, ERROR_BORDER)}>
          {errors.form}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        className="flex w-full items-center justify-center rounded-full bg-accent px-8 py-4 font-display text-lg font-medium text-paper shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-accent-dim active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 md:text-xl"
      >
        {submitting ? 'Setting up…' : 'Join Pop Tips!'}
      </button>
    </div>
  );
}

/* ── Small field primitives (Power of Ten: small, single-purpose) ─── */

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
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim"
      >
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
