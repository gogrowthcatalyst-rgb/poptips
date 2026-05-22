import { LegalPage, LegalSection } from '@/components/LegalPage';

export const metadata = {
  title: 'Terms',
  description:
    'The terms for using Pop Tips. Plain English where possible — Pop Tips facilitates, never holds money.',
};

const SECTIONS = [
  { id: 'acceptance', label: 'Acceptance' },
  { id: 'service', label: 'The service' },
  { id: 'account', label: 'Your account' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'conduct', label: 'Conduct' },
  { id: 'payment-apps', label: 'Payment apps' },
  { id: 'refunds', label: 'Refunds' },
  { id: 'ip', label: 'IP & brand' },
  { id: 'termination', label: 'Termination' },
  { id: 'disclaimers', label: 'Disclaimers' },
  { id: 'governing', label: 'Governing law' },
  { id: 'changes', label: 'Changes' },
  { id: 'contact', label: 'Contact' },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms,"
      titleAccent="plainly."
      tone="gold"
      lastUpdated="2026-05-11"
      sections={SECTIONS}
      intro={
        <>
          <p>
            By using Pop Tips, you agree to these terms. We&rsquo;ve written them in plain
            English where we can. The headline: Pop Tips facilitates tipping; we never hold
            your money; you&rsquo;re responsible for what you send and what you receive.
          </p>
        </>
      }
    >
      <LegalSection
        id="acceptance"
        number="01"
        title={<>Accepting <em className="italic text-gold-500">these terms.</em></>}
      >
        <p>
          By creating a Pop Tips account, scanning a Pop Tips QR code to send a tip, or
          using the Pop Tips webapp, you agree to these Terms of Service (&ldquo;Terms&rdquo;).
          If you don&rsquo;t agree, please don&rsquo;t use Pop Tips.
        </p>
        <p>
          You must be at least 18 years old to use Pop Tips. See our{' '}
          <a href="/privacy#minors" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-gold-500 hover:decoration-gold-500">Privacy Policy</a> for
          how we handle users who turn out to be under 18.
        </p>
      </LegalSection>

      <LegalSection
        id="service"
        number="02"
        title={<>What Pop Tips <em className="italic text-gold-500">actually does.</em></>}
      >
        <p>
          <strong className="font-medium text-ink">Pop Tips is a facilitator, not a wallet.</strong>{' '}
          When you send a tip through Pop Tips, the money does not move through a Pop Tips
          bank account or balance sheet. Pop Tips deep-links your phone into a P2P payment
          app (Venmo, Cash App, or PayPal) with the recipient&rsquo;s handle and
          your tip amount pre-filled. You confirm the transfer inside that app. The money
          moves directly between you and the recipient.
        </p>
        <p>
          This means:
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            Pop Tips is not a money services business, money transmitter, escrow, or
            payment processor.
          </li>
          <li>
            Pop Tips does not custody, hold, or transmit user funds.
          </li>
          <li>
            All payment processing is governed by the terms of the payment app you choose
            (Venmo, Cash App, or PayPal).
          </li>
          <li>
            Disputes about the underlying transfer (delayed funds, wrong amount, etc.) need
            to be raised with the relevant payment app. Pop Tips can&rsquo;t reverse,
            refund, or trace a payment because we never had it.
          </li>
        </ul>
        <p>
          For tippers, Pop Tips also charges a separate annual fee and per-tip small fee
          for use of the service (see{' '}
          <a href="#pricing" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-gold-500 hover:decoration-gold-500">Section 04</a>).
          That billing flows through Stripe and is the only financial transaction Pop Tips
          itself processes.
        </p>
      </LegalSection>

      <LegalSection
        id="account"
        number="03"
        title={<>Your <em className="italic text-gold-500">account.</em></>}
      >
        <p>
          To use Pop Tips you create an account with a name, mobile phone, and email
          address.
        </p>
        <p>
          <strong className="font-medium text-ink">Worker accounts</strong> also choose a
          public handle (e.g. <span className="font-mono text-ink">pop.tips/your-name</span>),
          optionally add a profile photo, and list one or more payment-app handles
          (Venmo / Cash App / PayPal) for receiving tips.
        </p>
        <p>
          You agree to keep your account information accurate. You&rsquo;re responsible
          for what happens under your account, including any tips sent or received. If you
          believe someone else has gained access to your account, email{' '}
          <a href="mailto:hello@pop.tips" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-gold-500 hover:decoration-gold-500">hello@pop.tips</a> immediately.
        </p>
        <p>
          <strong className="font-medium text-ink">Handles</strong> are first-come,
          first-served, except for handles reserved by Pop Tips (system names, payment
          apps, brand terms — full list in our codebase). We may reclaim a handle if it
          impersonates a real person or business, infringes a trademark, or violates the
          conduct rules below.
        </p>
      </LegalSection>

      <LegalSection
        id="pricing"
        number="04"
        title={<>Pricing &amp; <em className="italic text-gold-500">billing.</em></>}
      >
        <p>
          <strong className="font-medium text-ink">Workers pay nothing.</strong> Ever.
          Receiving tips through Pop Tips is free for workers, with no fees of any kind
          taken from incoming tips by Pop Tips. (Payment apps may charge their own
          fees — see your wallet&rsquo;s explainer page on{' '}
          <a href="/venmo" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-gold-500 hover:decoration-gold-500">Venmo</a>,{' '}
          <a href="/cashapp" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-gold-500 hover:decoration-gold-500">Cash App</a>,{' '}
          <a href="/paypal" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-gold-500 hover:decoration-gold-500">PayPal</a>.)
        </p>
        <p>
          <strong className="font-medium text-ink">Tippers</strong> get their first three
          tips free, with no card required. Pop Tips charges tippers in two parts, beginning
          when you send your fourth tip:
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="font-medium text-ink">An annual fee of{' '}
            <span className="money font-semibold">$9.99</span></strong>, charged once when
            you send your fourth tip (the activation date) and again on each anniversary
            of that date.
          </li>
          <li>
            <strong className="font-medium text-ink">A small fee of{' '}
            <span className="money font-semibold">3.5%</span>, billed monthly in aggregate.</strong>{' '}
            We sum the dollar value of every tip you sent during the month and charge a
            single 3.5% line item for the total — once, at the start of the following
            month. Not per-tip. One monthly charge.
          </li>
        </ul>
        <p>
          The annual fee renews on the anniversary of your fourth tip (the activation
          date), not on a calendar year basis. You can cancel at any time before the next
          annual renewal and won&rsquo;t be charged the annual fee again. Existing free
          trial tips do not reset on cancellation.
        </p>
        <p>
          <strong className="font-medium text-ink">The recipient always receives 100% of
          the tip amount</strong> you confirm in the payment app. The 3.5% monthly small
          fee is a separate charge to your billing method on top of the tips — never
          deducted from a worker&rsquo;s tip.
        </p>
        <p>
          We may change pricing in the future, but existing tippers will be notified at
          least 30 days before any price change takes effect on their account.
        </p>
      </LegalSection>

      <LegalSection
        id="conduct"
        number="05"
        title={<>How to <em className="italic text-gold-500">behave.</em></>}
      >
        <p>You agree not to use Pop Tips to:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            Impersonate another person or business, or claim a handle that misleads about
            who you are.
          </li>
          <li>
            Send tips for transactions that violate any law — including but not limited
            to money laundering, fraud, tax evasion, or illegal goods and services.
          </li>
          <li>
            Receive tips for activities the underlying payment app prohibits
            (Venmo / Cash App / PayPal all maintain their own prohibited-use lists).
          </li>
          <li>
            Harass, stalk, threaten, or intimidate other users.
          </li>
          <li>
            Reverse-engineer, scrape, or otherwise attempt to extract data from Pop Tips
            beyond what the public service exposes.
          </li>
          <li>
            Use Pop Tips to send any material that&rsquo;s defamatory, obscene, or
            infringes intellectual property.
          </li>
        </ul>
        <p>
          Violations may result in immediate account suspension or termination, at our
          sole discretion. Serious violations may be reported to law enforcement.
        </p>
      </LegalSection>

      <LegalSection
        id="payment-apps"
        number="06"
        title={<>Third-party <em className="italic text-gold-500">payment apps.</em></>}
      >
        <p>
          Pop Tips does not operate Venmo, Cash App, or PayPal. Each is a separate
          service with its own terms, fee schedule, and limits. When you tap to send a
          tip, Pop Tips hands off to the relevant app — what happens inside that app is
          governed by their terms, not ours.
        </p>
        <p>
          This means Pop Tips cannot guarantee:
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>That a payment app will accept your specific transaction.</li>
          <li>The speed of fund availability (transfers can range from instant to 1–3 business days depending on the app and funding source).</li>
          <li>That a sent tip can be reversed, refunded, or canceled. Most P2P transfers are final.</li>
          <li>The availability of any payment app at any given time.</li>
        </ul>
        <p>
          If a tip you sent didn&rsquo;t arrive, or you have a dispute about a transfer,
          contact the payment app directly. Pop Tips can confirm we successfully
          deep-linked you into the transfer, but we have no visibility into or control
          over what happened in the app afterward.
        </p>
      </LegalSection>

      <LegalSection
        id="refunds"
        number="07"
        title={<>Refunds for Pop Tips <em className="italic text-gold-500">charges.</em></>}
      >
        <p>
          The Pop Tips annual fee and the monthly aggregated small fee (see{' '}
          <a href="#pricing" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-gold-500 hover:decoration-gold-500">Section 04</a>) are
          the only charges Pop Tips itself processes.
        </p>
        <p>
          <strong className="font-medium text-ink">Annual fee.</strong> Refundable within 30
          days of the charge if you&rsquo;ve sent fewer than 5 tips in that period. Email{' '}
          <a href="mailto:hello@pop.tips" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-gold-500 hover:decoration-gold-500">hello@pop.tips</a> to request.
        </p>
        <p>
          <strong className="font-medium text-ink">Monthly small fee.</strong> Since this
          is billed monthly in aggregate (summed across the prior month&rsquo;s tips), a
          full refund of any monthly bill is generally not available — the underlying tips
          have already been delivered through the payment apps. However, you can dispute
          individual tip line items from a billed month if a tip was obviously a mistake
          (wrong amount entered, sent to the wrong person, or fraudulent activity on your
          account). Contact{' '}
          <a href="mailto:hello@pop.tips" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-gold-500 hover:decoration-gold-500">hello@pop.tips</a> within
          7 days of the monthly charge. If we agree, we&rsquo;ll credit the disputed
          line items back to your next month&rsquo;s bill or refund the proportional
          amount.
        </p>
        <p>
          For disputes about the underlying P2P transfer (i.e. the tip itself, not the
          Pop Tips fee), contact the payment app you used — see{' '}
          <a href="#payment-apps" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-gold-500 hover:decoration-gold-500">Section 06</a>.
        </p>
      </LegalSection>

      <LegalSection
        id="ip"
        number="08"
        title={<>The Pop Tips <em className="italic text-gold-500">brand.</em></>}
      >
        <p>
          &ldquo;Pop Tips&rdquo;, &ldquo;pop.tips&rdquo;, the Pop Tips logo, and our visual
          identity are owned by Pop Tips. You&rsquo;re welcome to refer to Pop Tips by
          name and to display your own QR code (which we generate for you and which
          includes Pop Tips branding) on stickers, business cards, aprons, and similar.
        </p>
        <p>
          You may not use our brand to imply endorsement, partnership, or affiliation
          beyond what&rsquo;s actually true. You may not create a competing tipping
          service using our name or visual identity.
        </p>
        <p>
          Content you create on Pop Tips (your handle, profile photo, profile message)
          remains yours. By using Pop Tips you grant us a worldwide, non-exclusive,
          royalty-free license to display that content as needed to operate the service
          (e.g. showing your profile to tippers who scan your code).
        </p>
      </LegalSection>

      <LegalSection
        id="termination"
        number="09"
        title={<>Closing an <em className="italic text-gold-500">account.</em></>}
      >
        <p>
          <strong className="font-medium text-ink">You can close your account at any time</strong>{' '}
          via your dashboard, or by emailing{' '}
          <a href="mailto:hello@pop.tips" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-gold-500 hover:decoration-gold-500">hello@pop.tips</a>. Most
          personal data is removed within 30 days; see the{' '}
          <a href="/privacy#retention" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-gold-500 hover:decoration-gold-500">Privacy Policy</a> for what we retain
          and why.
        </p>
        <p>
          <strong className="font-medium text-ink">We can close an account</strong> for
          violations of these Terms, fraudulent activity, or extended inactivity. For
          conduct violations we&rsquo;ll typically reach out first; for fraud or serious
          violations we may suspend immediately and ask questions after. Any unused
          portion of an annual fee is refunded if we terminate without cause.
        </p>
      </LegalSection>

      <LegalSection
        id="disclaimers"
        number="10"
        title={<>What we <em className="italic text-gold-500">can&rsquo;t promise.</em></>}
      >
        <p>
          Pop Tips is provided &ldquo;as is.&rdquo; We work hard to keep the service
          reliable, but we can&rsquo;t guarantee uninterrupted availability, freedom from
          errors, or that every QR code we generate will work with every phone camera in
          every lighting condition forever.
        </p>
        <p>
          To the maximum extent permitted by law, Pop Tips disclaims all warranties,
          express or implied, including merchantability, fitness for a particular purpose,
          and non-infringement.
        </p>
        <p>
          Pop Tips&rsquo; total liability to you for any claim arising from these Terms or
          your use of the service is limited to the amount you paid Pop Tips in the 12
          months preceding the event giving rise to the claim, or one hundred dollars
          (whichever is greater).
        </p>
        <p>
          Nothing in this section limits liability that can&rsquo;t lawfully be limited.
        </p>
      </LegalSection>

      <LegalSection
        id="governing"
        number="11"
        title={<>Governing <em className="italic text-gold-500">law.</em></>}
      >
        <p>
          These Terms are governed by the laws of the State of North Carolina, USA,
          without regard to conflict-of-law principles. Disputes will be resolved in the
          state or federal courts located in Wake County, North Carolina, unless required
          by mandatory consumer-protection law to be brought elsewhere.
        </p>
        <p className="rounded-2xl border border-gold-500/30 bg-paper px-5 py-4 text-sm">
          <strong className="font-medium text-ink">Note:</strong> jurisdiction and venue
          are placeholders pending final business formation. This section will be updated
          to reflect Pop Tips&rsquo; formal jurisdiction once registered.
        </p>
      </LegalSection>

      <LegalSection
        id="changes"
        number="12"
        title={<>When we <em className="italic text-gold-500">update these.</em></>}
      >
        <p>
          We may update these Terms from time to time. For material changes (anything that
          affects what you owe, what we promise, or how disputes are handled),
          we&rsquo;ll notify active users by email or in-app banner at least 14 days
          before the change takes effect. Continued use of Pop Tips after a change means
          you accept the new Terms.
        </p>
        <p>
          For non-material changes (typo fixes, clarifications, updating service-provider
          names), we&rsquo;ll just update the &ldquo;last updated&rdquo; date at the top.
        </p>
      </LegalSection>

      <LegalSection
        id="contact"
        number="13"
        title={<>Reaching <em className="italic text-gold-500">us.</em></>}
      >
        <p>
          For questions about these Terms, billing disputes, conduct concerns, or anything
          else: email{' '}
          <a href="mailto:hello@pop.tips" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-gold-500 hover:decoration-gold-500">hello@pop.tips</a>.
          A real person reads every message.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
