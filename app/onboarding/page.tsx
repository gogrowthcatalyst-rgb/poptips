import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/server';
import { getRecipientById } from '@/lib/db/recipients';
import { ProfileCompletionForm } from '@/components/ProfileCompletionForm';

export const metadata = {
  title: 'Finish setting up',
  description: 'Add your payment apps and photo to start receiving tips.',
};

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session || session.role !== 'recipient') {
    redirect('/');
  }

  const recipient = await getRecipientById(session.userId);
  if (!recipient) {
    redirect('/');
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12 md:py-16">
      <header className="mb-8 text-center">
        <p className="font-mono text-xs font-medium uppercase tracking-wider2 text-accent">
          Almost there
        </p>
        <h1 className="mt-2 font-display text-4xl font-medium italic leading-tight text-ink md:text-5xl">
          Let&rsquo;s make your page tippable.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-dim">
          Add where your tips should land and a photo, and{' '}
          <span className="font-mono text-ink-dim">pop.tips/{recipient.handle}</span> goes live.
        </p>
      </header>

      <div className="rounded-3xl border border-line-soft bg-surface p-6 shadow-md md:p-8">
        <ProfileCompletionForm
          handle={recipient.handle}
          displayName={recipient.displayName}
          initialRole={recipient.role}
          initialMessage={recipient.message}
          initialPhotoUrl={recipient.photoUrl}
        />
      </div>
    </main>
  );
}
