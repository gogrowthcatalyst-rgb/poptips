import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/server';
import { getBusinessById, getPropertiesForBusiness } from '@/lib/db/business';
import { tierMeta } from '@/lib/corp/tiers';

export const metadata = { title: 'Admin — Pop Tips for Organizations' };
export const dynamic = 'force-dynamic';

const CORAL = {
  '--accent': '#F06844',
  '--accent-dim': '#C44A2C',
  '--accent-glow': '#FFA587',
} as React.CSSProperties;

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== 'business' || !session.businessId) redirect('/');

  const business = await getBusinessById(session.businessId);
  if (!business) redirect('/');
  const props = await getPropertiesForBusiness(business.id);
  const plan = tierMeta(business.tier ?? '');

  return (
    <main style={CORAL} className="mx-auto max-w-3xl px-5 pb-24 pt-10 md:px-8 md:pt-14">
      <header className="mb-8">
        <p className="font-mono text-xs font-medium uppercase tracking-wider2 text-accent">
          Admin · {session.businessRole ?? 'owner'}
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium leading-tight tracking-tightest text-ink md:text-4xl">
          {business.name}
        </h1>
        <p className="mt-2 text-sm text-ink-dim">
          {plan ? `${plan.label} · $${plan.priceMonthly}/location/mo` : 'Plan'} ·{' '}
          <span className="font-mono uppercase tracking-wider2 text-jade-700">{business.status}</span>
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-medium text-ink">Your locations & QR codes</h2>
        {props.map((p) => (
          <div key={p.id} className="rounded-2xl border border-line bg-paper px-5 py-5">
            <p className="font-display text-base font-medium text-ink">{p.name}</p>
            {p.address && <p className="text-sm text-ink-dim">{p.address}</p>}
            <div className="mt-4 space-y-3">
              <QrRow label="Guest QR — customers tip your team (fee waived)" url={p.qrUrl} />
              <QrRow label="Staff QR — your team signs up here" url={p.staffQrUrl} />
            </div>
          </div>
        ))}
      </section>

      <p className="mt-8 rounded-xl border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-faint">
        This is your account home. Roster, reports, downloadable QR images, adding locations, and
        inviting teammates land here next.
      </p>
    </main>
  );
}

function QrRow({ label, url }: { label: string; url: string | null }) {
  return (
    <div>
      <p className="font-mono text-xs font-medium uppercase tracking-wider2 text-ink-dim">{label}</p>
      <p className="mt-1 break-all rounded-lg bg-surface px-3 py-2 font-mono text-sm text-ink">
        {url ?? '—'}
      </p>
    </div>
  );
}
