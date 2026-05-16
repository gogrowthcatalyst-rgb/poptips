import { PaymentExplainer, ExplainerSection } from '@/components/PaymentExplainer';

export const metadata = {
  title: 'Tipping with Cash App',
  description:
    'How Cash App works with Pop Tips. Free between personal accounts. Popular for younger and gig-economy users.',
};

export default function CashAppPage() {
  return (
    <PaymentExplainer
      walletName="Cash App"
      walletNameAccent={<em className="italic text-accent">Cash App</em>}
      lede="Built by Block (formerly Square). Free between personal accounts. Popular with younger users and the gig economy — a strong fit if your customers skew that way."
    >
      {/* HOW IT WORKS */}
      <ExplainerSection
        eyebrow="01 · How it works with Pop Tips"
        title={<>Your <em className="italic text-accent">$cashtag</em> does the work.</>}
      >
        <p>
          <strong className="font-medium text-ink">For tippers:</strong> on a recipient&rsquo;s
          send page, tap the Cash App option. Pop Tips opens Cash App with the
          recipient&rsquo;s $cashtag and your tip amount filled in. You confirm. Money goes
          straight from your Cash App to theirs.
        </p>
        <p>
          <strong className="font-medium text-ink">For workers:</strong> add your{' '}
          <span className="font-mono text-ink">$cashtag</span> in your Pop Tips dashboard.
          That&rsquo;s the address tippers will reach. Cash App receives the funds; Pop Tips
          never touches them.
        </p>
      </ExplainerSection>

      {/* FEES */}
      <ExplainerSection
        eyebrow="02 · Fees, plainly"
        title={<>Free <em className="italic text-accent">when funded the right way.</em></>}
      >
        <ul className="space-y-3">
          <li>
            <strong className="font-medium text-ink">Free</strong> when funded by your linked
            bank account, debit card, or Cash App balance. Personal payments — including
            tips — fall under this.
          </li>
          <li>
            <strong className="font-medium text-ink">3% fee</strong> if you fund a tip with a
            credit card. Skip this by linking a bank account or debit card in Cash App
            settings.
          </li>
          <li>
            <strong className="font-medium text-ink">Receiving is always free</strong> for
            workers. Tips arrive as personal payments — no fee on the receiving side.
          </li>
          <li>
            <strong className="font-medium text-ink">
              Cash-out: free standard, 0.5–1.75% instant.
            </strong>{' '}
            Standard deposit to your bank is free and takes 1–3 business days. Instant deposit
            is{' '}
            <span className="money font-semibold text-ink">0.5%–1.75%</span> (minimum{' '}
            <span className="money font-semibold text-ink">$0.25</span>). Like Venmo: leave
            money in Cash App until you actually need it, pull out free.
          </li>
        </ul>
      </ExplainerSection>

      {/* SETUP */}
      <ExplainerSection
        eyebrow="03 · New to Cash App?"
        title={<>Phone, email, debit card. <em className="italic text-accent">Done.</em></>}
      >
        <p>Setup takes about five minutes.</p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Download from the{' '}
            <a
              href="https://apps.apple.com/us/app/cash-app/id711923939"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent-dim hover:decoration-accent"
            >
              App Store
            </a>{' '}
            or{' '}
            <a
              href="https://play.google.com/store/apps/details?id=com.squareup.cash"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent-dim hover:decoration-accent"
            >
              Google Play
            </a>
            .
          </li>
          <li>Sign up with your phone or email. Verify with the code they send.</li>
          <li>Link a debit card or bank account. (Avoid credit cards — there&rsquo;s a fee.)</li>
          <li>
            Pick your{' '}
            <span className="font-mono text-ink">$cashtag</span> — your unique handle.
            Cash App requires it to start with a $. Pick something memorable: it&rsquo;s how
            people send you money everywhere, not just here.
          </li>
        </ol>
      </ExplainerSection>
    </PaymentExplainer>
  );
}
