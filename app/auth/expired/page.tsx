import { ResendForm } from '@/components/ResendForm';
import { Logo } from '@/components/Logo';

export const metadata = {
  title: 'Link expired',
  description: 'Your magic link has expired. Request a fresh one.',
};

export default function AuthExpiredPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-line-soft bg-surface p-8 text-center shadow-md md:p-10">
        <Logo variant="icon" height={40} className="mx-auto mb-5 opacity-60" alt="Pop Tips" />
        <h1 className="font-display text-3xl font-medium italic leading-tight text-ink">
          That link has expired.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-ink-dim">
          Magic links last 15 minutes for your security. Enter your email and
          we&rsquo;ll text you a fresh one.
        </p>

        <div className="mt-8 text-left">
          <ResendForm />
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-ink-faint">
        Already confirmed? You can close this and open Pop Tips normally.
      </p>
    </main>
  );
}
