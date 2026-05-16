import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 py-20 text-center md:px-8">
      <Logo
        variant="icon"
        height={64}
        className="mb-8 opacity-25"
        alt=""
      />
      <p className="mb-4 font-mono text-xs font-medium uppercase tracking-wider2 text-ink-faint">
        404 · not here
      </p>
      <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-tightest text-ink text-balance md:text-7xl">
        <em className="italic">This tip jar</em> doesn&rsquo;t exist.
      </h1>
      <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-ink-dim md:text-lg">
        Either the handle was mistyped, or the worker hasn&rsquo;t set up their code yet. Either
        way — no money got lost. We never had any.
      </p>
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-paper transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-accent-dim hover:shadow-lift active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-glow"
        >
          Back to home
        </Link>
        <Link
          href="/signup-recipient"
          className="rounded-full border border-line bg-paper px-7 py-3.5 text-sm font-medium text-ink-dim transition-colors duration-200 hover:border-accent hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-glow"
        >
          Claim a handle
        </Link>
      </div>
    </main>
  );
}
