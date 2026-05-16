import { PaymentExplainer, ExplainerSection } from '@/components/PaymentExplainer';

export const metadata = {
  title: 'Tipping with PayPal',
  description:
    'How PayPal works with Pop Tips. Use Friends & Family to keep tips fee-free. Widest international reach of the four supported wallets.',
};

export default function PayPalPage() {
  return (
    <PaymentExplainer
      walletName="PayPal"
      walletNameAccent={<em className="italic text-accent">PayPal</em>}
      lede="The original digital wallet. Widest international reach. Works for tippers from almost anywhere — but the fee structure has one gotcha worth understanding before you use it."
    >
      {/* HOW IT WORKS */}
      <ExplainerSection
        eyebrow="01 · How it works with Pop Tips"
        title={<>Your <em className="italic text-accent">PayPal email</em> is the address.</>}
      >
        <p>
          <strong className="font-medium text-ink">For tippers:</strong> on a recipient&rsquo;s
          send page, tap the PayPal option. Pop Tips opens PayPal pre-filled with the
          recipient&rsquo;s email and your tip amount. Confirm and send.
        </p>
        <p>
          <strong className="font-medium text-ink">For workers:</strong> add the email
          associated with your PayPal account in your Pop Tips dashboard. PayPal handles the
          rest. Pop Tips never sees your account.
        </p>
      </ExplainerSection>

      {/* FEES — the big one for PayPal */}
      <ExplainerSection
        eyebrow="02 · Fees · the one thing worth reading"
        title={<>Choose <em className="italic text-accent">&ldquo;Friends &amp; Family.&rdquo;</em></>}
      >
        <p>
          PayPal has two modes for sending money: <em>Friends &amp; Family</em> (the personal
          one) and <em>Goods &amp; Services</em> (the commercial one, with built-in buyer
          protection). The difference matters for tips:
        </p>
        <ul className="space-y-3">
          <li>
            <strong className="font-medium text-ink">Friends &amp; Family:</strong> Free if
            funded by your PayPal balance or linked bank.{' '}
            <span className="money font-semibold text-ink">2.9% + $0.30</span> if funded by
            credit or debit card (the tipper pays this — workers receive the full amount).
            This is the right choice for tips. Pop Tips defaults to this mode.
          </li>
          <li>
            <strong className="font-medium text-ink">Goods &amp; Services:</strong>{' '}
            <span className="money font-semibold text-ink">2.99% + ~$0.49</span> charged{' '}
            <em>to the recipient</em> — the worker pays this, not the tipper. Avoid for tips.
            This is what merchants use, not individuals receiving gratitude.
          </li>
          <li>
            <strong className="font-medium text-ink">
              Cash-out: free standard, 1.75% instant.
            </strong>{' '}
            Standard transfer to your bank is free and takes 1–3 business days. Instant
            transfer to bank or debit card is{' '}
            <span className="money font-semibold text-ink">1.75%</span> (minimum{' '}
            <span className="money font-semibold text-ink">$0.25</span>).
          </li>
        </ul>
        <p className="rounded-2xl border border-gold-500/30 bg-paper px-5 py-4 text-sm">
          <strong className="font-medium text-ink">Quick check for workers:</strong> if you
          ever see PayPal taking a fee out of an incoming tip, it was sent as Goods &amp;
          Services. Pop Tips opens the F&amp;F flow by default — but if a tipper manually
          switches inside PayPal, the fee comes out of your tip. Reach out to that tipper and
          let them know; PayPal can refund.
        </p>
      </ExplainerSection>

      {/* SETUP */}
      <ExplainerSection
        eyebrow="03 · New to PayPal?"
        title={<>It takes <em className="italic text-accent">about ten minutes.</em></>}
      >
        <p>
          PayPal has been around since the late 90s, so a lot of people technically have
          accounts they&rsquo;ve forgotten about. Worth checking before you make a new one.
        </p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>
            Sign up at{' '}
            <a
              href="https://www.paypal.com/us/welcome/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent-dim hover:decoration-accent"
            >
              paypal.com
            </a>{' '}
            — pick &ldquo;Personal Account&rdquo; (not Business). Or download the{' '}
            <a
              href="https://apps.apple.com/us/app/paypal/id283646709"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent-dim hover:decoration-accent"
            >
              iOS app
            </a>{' '}
            or{' '}
            <a
              href="https://play.google.com/store/apps/details?id=com.paypal.android.p2pmobile"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent-dim hover:decoration-accent"
            >
              Android app
            </a>
            .
          </li>
          <li>Verify your email and phone. PayPal will send codes to both.</li>
          <li>
            Link a bank account or debit card. Bank verification adds a day or two (PayPal
            sends small deposits you confirm), but unlocks free funding for sending.
          </li>
          <li>
            Confirm your identity if PayPal asks — for new accounts they may require ID
            verification before higher limits unlock.
          </li>
        </ol>
      </ExplainerSection>
    </PaymentExplainer>
  );
}
