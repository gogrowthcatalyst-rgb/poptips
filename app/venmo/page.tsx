import { PaymentExplainer, ExplainerSection } from '@/components/PaymentExplainer';

export const metadata = {
  title: 'Tipping with Venmo',
  description:
    'How Venmo works with Pop Tips. Free between personal accounts. The default Pop Tips recommends for tippers who don’t already have a wallet.',
};

export default function VenmoPage() {
  return (
    <PaymentExplainer
      walletName="Venmo"
      walletNameAccent={<em className="italic text-accent">Venmo</em>}
      lede="The most-used payment app in the US. Free between personal accounts. If you don't already have a wallet on your phone, this is the one Pop Tips recommends — five minutes to set up, then you're tipping in seconds."
    >
      {/* HOW IT WORKS */}
      <ExplainerSection
        eyebrow="01 · How it works with Pop Tips"
        title={<>The <em className="italic text-accent">handoff</em> is invisible.</>}
      >
        <p>
          <strong className="font-medium text-ink">For tippers:</strong> on a recipient&rsquo;s
          send page, tap the Venmo option. Pop Tips opens Venmo with the recipient&rsquo;s
          handle and your tip amount already filled in. You confirm. The money goes from your
          Venmo account directly to theirs. We never see it.
        </p>
        <p>
          <strong className="font-medium text-ink">For workers:</strong> in your dashboard, add
          your Venmo handle (the <span className="font-mono text-ink">@username</span> people
          use to send you money). That&rsquo;s the address Pop Tips will hand off to. Your
          handle is yours; we never touch your Venmo balance.
        </p>
      </ExplainerSection>

      {/* FEES */}
      <ExplainerSection
        eyebrow="02 · Fees, plainly"
        title={<>Free <em className="italic text-accent">in almost every case.</em></>}
      >
        <ul className="space-y-3">
          <li>
            <strong className="font-medium text-ink">Free</strong> when funded by your linked
            bank account, debit card, or Venmo balance. This is the default for personal
            payments and covers the overwhelming majority of tips.
          </li>
          <li>
            <strong className="font-medium text-ink">3% fee</strong> if you fund the tip with a
            credit card. Avoid this by linking a bank account or debit card in Venmo&rsquo;s
            settings — takes 30 seconds.
          </li>
          <li>
            <strong className="font-medium text-ink">Receiving is always free</strong> for
            workers. Tips arrive as personal payments, which Venmo doesn&rsquo;t charge for.
          </li>
          <li>
            <strong className="font-medium text-ink">Cash-out: free standard, 1.75% instant.</strong>
            Standard transfer to your bank takes 1–3 business days and costs nothing. Instant
            transfer is{' '}
            <span className="money font-semibold text-ink">1.75%</span>{' '}
            (minimum <span className="money font-semibold text-ink">$0.25</span>, capped at{' '}
            <span className="money font-semibold text-ink">$25</span>). Most workers leave
            money in Venmo until it adds up, then pull it out free.
          </li>
        </ul>
      </ExplainerSection>

      {/* SETUP */}
      <ExplainerSection
        eyebrow="03 · New to Venmo?"
        title={<>Five minutes. <em className="italic text-accent">That&rsquo;s it.</em></>}
      >
        <p>You&rsquo;ll need a phone number, an email, and a debit card or bank account.</p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Download from the{' '}
            <a
              href="https://apps.apple.com/us/app/venmo/id351727428"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent-dim hover:decoration-accent"
            >
              App Store
            </a>{' '}
            or{' '}
            <a
              href="https://play.google.com/store/apps/details?id=com.venmo"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent-dim hover:decoration-accent"
            >
              Google Play
            </a>
            .
          </li>
          <li>Sign up with your phone and email. Verify both via the codes they send.</li>
          <li>
            Add a payment method: a debit card or bank account. (Skip credit card unless you
            need it — there&rsquo;s a fee for using one.)
          </li>
          <li>
            Pick your{' '}
            <span className="font-mono text-ink">@username</span> — this is the handle
            you&rsquo;ll share. Make it memorable; it&rsquo;s how people send you money.
          </li>
        </ol>
        <p>
          Once you&rsquo;re in, you can use Venmo anywhere — Pop Tips just gives you a tidy
          way to receive tips from anyone who scans your code, without making them learn a new
          app.
        </p>
      </ExplainerSection>
    </PaymentExplainer>
  );
}
