import Link from 'next/link';

export const metadata = {
  title: 'Acceptable Use Policy',
  description: 'How Pop Tips may and may not be used.',
};

export default function AcceptableUsePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <p className="font-mono text-xs font-medium uppercase tracking-wider2 text-accent">
        The rules of the road
      </p>
      <h1 className="mt-2 font-display text-4xl font-medium italic leading-tight text-ink md:text-5xl">
        Acceptable Use Policy
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-dim">
        Pop Tips exists to help people directly appreciate the workers who serve
        them. To keep it safe and trustworthy for everyone, the following uses are
        not allowed. Breaking these rules can lead to limits, suspension, removal,
        and where required, reporting to the appropriate authorities.
      </p>

      <section className="mt-10 space-y-8">
        <PolicyBlock title="You must be 18 or older">
          Pop Tips is only for adults. You must be at least 18 years of age to
          create an account or use the service in any capacity. Accounts we believe
          belong to minors are removed.
        </PolicyBlock>

        <PolicyBlock title="No illegal activity">
          You may not use Pop Tips to facilitate, disguise, or receive payment for
          anything unlawful — including money laundering, structuring, fraud,
          payments for illegal goods or services, or evading taxes or sanctions.
          Pop Tips never holds funds, but using it as a layer to obscure illicit
          payments is strictly prohibited.
        </PolicyBlock>

        <PolicyBlock title="No adult or sexual services">
          Pop Tips may not be used to solicit, advertise, or receive payment for
          sexual or adult services. This may evolve over time, but for now such use
          is not permitted.
        </PolicyBlock>

        <PolicyBlock title="Be who you say you are">
          You may not impersonate another person or business, claim a handle or name
          that misrepresents who you are, or set up a profile designed to intercept
          tips meant for someone else. Your photo and details should honestly
          represent you, so the people tipping you know their thanks reached the
          right person.
        </PolicyBlock>

        <PolicyBlock title="Don't tamper with QR codes or links">
          You may not place, alter, or cover Pop Tips QR codes to redirect tips away
          from their intended recipient, and you may not post deceptive, phishing, or
          malicious links anywhere on the platform.
        </PolicyBlock>

        <PolicyBlock title="No abuse of the platform">
          No spamming, scraping, automated mass account creation, harassment, or
          attempts to circumvent the protections described here. We monitor for
          patterns that indicate exploitation and act on what we find.
        </PolicyBlock>
      </section>

      <p className="mt-12 rounded-2xl border border-line-soft bg-surface px-6 py-5 text-sm leading-relaxed text-ink-faint">
        This policy works alongside our{' '}
        <Link href="/terms" className="font-medium text-accent underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="font-medium text-accent underline">
          Privacy Policy
        </Link>
        . We may update it as Pop Tips grows. Questions? Reach out any time.
      </p>
    </main>
  );
}

function PolicyBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl font-medium text-ink md:text-2xl">{title}</h2>
      <p className="mt-2 text-base leading-relaxed text-ink-dim">{children}</p>
    </div>
  );
}
