import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TrackForcer } from '@/components/TrackForcer';
import { AccountForm, type AccountInitial } from '@/components/AccountForm';
import { getSession } from '@/lib/auth/server';
import { getRecipientById, getTipperById } from '@/lib/db/profile';
import { ArrowLeft } from '@/components/icons';
import type { PaymentApp } from '@/lib/payment-apps';

export const metadata = { title: 'Edit your profile' };

// Always read fresh — this is the user's own editable data.
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect('/');
  if (session.role === 'business') redirect('/admin'); // admins use /admin, not /account

  let initial: AccountInitial;
  let backHref = '/';

  if (session.role === 'recipient') {
    const r = await getRecipientById(session.userId);
    if (!r) redirect('/');
    backHref = '/dashboard';
    initial = {
      role: 'recipient',
      firstName: r.firstName ?? '',
      lastName: r.lastName ?? '',
      homeZip: r.homeZip ?? '',
      primaryIndustry: r.primaryIndustry ?? '',
      industryOther: r.industryOther ?? '',
      birthYear: r.birthYear != null ? String(r.birthYear) : '',
      photoUrl: r.photoUrl,
      serviceRole: r.role ?? '',
      message: r.message ?? '',
      workplaceName: r.workplaceName ?? '',
      workplaceAddress: r.workplaceAddress ?? '',
      workplacePhone: r.workplacePhone ?? '',
    };
  } else {
    const t = await getTipperById(session.userId);
    if (!t) redirect('/');
    backHref = '/dashboard/tipper';
    initial = {
      role: 'tipper',
      firstName: t.firstName ?? '',
      lastName: t.lastName ?? '',
      homeZip: t.homeZip ?? '',
      primaryIndustry: t.primaryIndustry ?? '',
      industryOther: t.industryOther ?? '',
      birthYear: t.birthYear != null ? String(t.birthYear) : '',
      usesApps: (t.usesApps ?? []) as PaymentApp[],
    };
  }

  return (
    <>
      <TrackForcer track={session.role} />

      <main className="mx-auto max-w-2xl px-5 pb-24 pt-8 md:px-8 md:pt-12">
        <Link
          href={backHref}
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim transition-colors duration-200 hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
          <span>Back</span>
        </Link>

        <header className="mb-8 md:mb-10">
          <p className="font-mono text-xs font-medium uppercase tracking-wider2 text-accent">
            Your profile
          </p>
          <h1 className="mt-1 font-display text-3xl font-medium leading-tight tracking-tightest text-ink md:text-4xl">
            Edit your details
          </h1>
          <p className="mt-2 text-base leading-relaxed text-ink-dim">
            Keep things current — change your photo, where you work, or how people find you.
          </p>
        </header>

        <AccountForm initial={initial} />
      </main>
    </>
  );
}
