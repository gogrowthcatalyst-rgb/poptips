import { LegalPage, LegalSection } from '@/components/LegalPage';

export const metadata = {
  title: 'Privacy',
  description:
    'How Pop Tips handles your information. The short version: minimal data, never sold, used only to make tipping work.',
};

const SECTIONS = [
  { id: 'what-we-collect', label: 'What we collect' },
  { id: 'how-we-use', label: 'How we use it' },
  { id: 'who-we-share', label: 'Who we share with' },
  { id: 'money', label: 'Money handling' },
  { id: 'sms-email', label: 'SMS & email' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'minors', label: 'Minors' },
  { id: 'your-rights', label: 'Your rights' },
  { id: 'retention', label: 'Retention' },
  { id: 'changes', label: 'Changes' },
  { id: 'contact', label: 'Contact' },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy,"
      titleAccent="plainly."
      tone="jade"
      lastUpdated="2026-05-11"
      sections={SECTIONS}
      intro={
        <>
          <p>
            The short version: we collect the minimum we need to make tipping work, we
            don&rsquo;t sell your data to anyone, and we don&rsquo;t touch the money. If
            you want the full picture, read on.
          </p>
        </>
      }
    >
      <LegalSection
        id="what-we-collect"
        number="01"
        title={<>What we <em className="italic text-jade-500">collect.</em></>}
      >
        <p>
          To make Pop Tips work, we collect a small set of information from each user.
          We&rsquo;ve tried to keep this list short on purpose.
        </p>
        <p>
          <strong className="font-medium text-ink">From everyone:</strong> your first
          name, last name, mobile phone number, and email address. For workers, also: the
          handle you choose for your tipping page (e.g.{' '}
          <span className="font-mono text-ink">pop.tips/your-name</span>), an optional
          profile photo, and the payment-app handles you list for receiving tips (Venmo,
          Cash App, or PayPal).
        </p>
        <p>
          <strong className="font-medium text-ink">Automatically:</strong> standard
          technical information like your IP address, browser type, device type, and
          rough geographic region (city / state level — derived from your IP). We do not
          collect precise location data.
        </p>
        <p>
          <strong className="font-medium text-ink">For tippers, additionally:</strong> a
          payment method (tokenized via our payment processor — see{' '}
          <a href="#who-we-share" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-jade-500 hover:decoration-jade-500">Section 03</a>),
          a record of which tips you&rsquo;ve sent through Pop Tips, and the timestamp of
          each tip. We do not see or store full credit-card numbers — those live with our
          payment processor (Stripe).
        </p>
      </LegalSection>

      <LegalSection
        id="how-we-use"
        number="02"
        title={<>How we <em className="italic text-jade-500">use it.</em></>}
      >
        <p>The information above is used for the following purposes, and no others:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="font-medium text-ink">Operating the service.</strong> Creating
            your account, generating your QR code, deep-linking tippers into the right
            payment app, sending you account-related notifications.
          </li>
          <li>
            <strong className="font-medium text-ink">Billing.</strong> For tippers, charging
            the annual fee after your third tip and computing the per-tip small fee.
          </li>
          <li>
            <strong className="font-medium text-ink">Communication.</strong> Sending you
            magic links to sign in, account confirmations, billing notices, and (with your
            consent) occasional product updates.
          </li>
          <li>
            <strong className="font-medium text-ink">Security &amp; fraud prevention.</strong>{' '}
            Detecting and preventing abuse, fraud, or violations of our Terms.
          </li>
          <li>
            <strong className="font-medium text-ink">Improving the product.</strong> Aggregated
            usage data helps us understand which features work and which don&rsquo;t. We
            never use individual data to single anyone out.
          </li>
          <li>
            <strong className="font-medium text-ink">Legal compliance.</strong> If a court
            order or law requires it, we may use your data to comply.
          </li>
        </ul>
        <p>
          <strong className="font-medium text-ink">We do not sell your data.</strong> Not to
          advertisers, not to data brokers, not to anyone. We don&rsquo;t share it for
          third-party marketing. The only entities we share data with are the service
          providers listed below — and only to the extent they need to do their job for us.
        </p>
      </LegalSection>

      <LegalSection
        id="who-we-share"
        number="03"
        title={<>Who we <em className="italic text-jade-500">share with.</em></>}
      >
        <p>
          To run a payment-adjacent service in 2026, we need a small handful of service
          providers. Each handles a narrow part of the experience:
        </p>
        <ul className="ml-5 list-disc space-y-3">
          <li>
            <strong className="font-medium text-ink">Stripe</strong> — payment processing.
            When a tipper adds a card, Stripe handles the vaulting and recurring billing.
            We receive a token referring to that card; the actual card number never touches
            our servers. Stripe&rsquo;s privacy policy applies to data they hold.
          </li>
          <li>
            <strong className="font-medium text-ink">GoHighLevel (GHL)</strong> — our CRM
            and communications layer. Stores your contact record (name, phone, email) and
            sends the magic-link texts and account emails. Subject to their privacy policy
            and CTIA-compliant SMS rules (see{' '}
            <a href="#sms-email" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-jade-500 hover:decoration-jade-500">Section 05</a>).
          </li>
          <li>
            <strong className="font-medium text-ink">Vercel</strong> — our hosting provider.
            Holds the application and database. US-based with standard security
            certifications.
          </li>
          <li>
            <strong className="font-medium text-ink">Vercel Blob</strong> — storage for your
            profile photo (workers only).
          </li>
          <li>
            <strong className="font-medium text-ink">Analytics providers</strong> — Google
            Analytics 4 and PostHog. We use these to understand aggregate behavior. No
            personally identifiable information is sent to either; we use anonymized
            identifiers only.
          </li>
        </ul>
        <p>
          We&rsquo;ll add to this list only when adding a new service provider is necessary
          to operate Pop Tips, and we&rsquo;ll update this page when that happens.
        </p>
      </LegalSection>

      <LegalSection
        id="money"
        number="04"
        title={<>About the <em className="italic text-jade-500">money.</em></>}
      >
        <p>
          This part is important because it changes how privacy law applies to us.
        </p>
        <p>
          <strong className="font-medium text-ink">
            Pop Tips never holds, custodies, or transmits your money.
          </strong>{' '}
          Tips do not flow through a Pop Tips bank account or balance sheet. We are not a
          money services business, not a money transmitter, not a wallet, and not an
          escrow.
        </p>
        <p>
          What we actually do: on the recipient&rsquo;s Pop Tips send page, you choose the
          tip amount and select which payment app you want to use (Venmo, Cash App, PayPal,
          or PayPal). Pop Tips then deep-links you into that app — the recipient&rsquo;s
          handle and the amount you chose are both pre-filled when the app opens. You
          confirm the payment inside the app. The money moves directly from your payment
          account to the recipient&rsquo;s. The relevant privacy policy at that point is
          the payment app&rsquo;s, not ours.
        </p>
        <p>
          We do see and record the <em>fact</em> of your tip (amount, time, recipient
          handle, app used) so we can show it on your dashboard and compute our small fee.
          We do not see your payment-app balance, history, or other transactions.
        </p>
      </LegalSection>

      <LegalSection
        id="sms-email"
        number="05"
        title={<>SMS &amp; email <em className="italic text-jade-500">communication.</em></>}
      >
        <p>
          Pop Tips communicates with you in two tiers, each with its own consent and opt-out.
          You can be subscribed to either, both, or neither — separately.
        </p>

        <p className="font-medium text-ink">
          Tier 1 — Account-essential messages.
        </p>
        <p>
          When you sign up, you authorize Pop Tips to text and email you for account-related
          purposes only: magic-link sign-ins, account confirmations, billing notices, and
          security alerts. These are required to operate your account and continue regardless
          of any marketing-tier preferences below.
        </p>

        <p className="font-medium text-ink">
          Tier 2 — Marketing communications (optional, opt-in only).
        </p>
        <p>
          With your explicit opt-in (separate from the consent above), we may send you
          occasional location-relevant suggestions — such as top tip spots near you, featured
          establishments in your city, or updates from partner organizations who care about
          the appreciation economy. This tier is fully optional: you can subscribe at signup
          or later in your account settings, and you can unsubscribe any time without affecting
          your account-essential messages.
        </p>

        <p>
          <strong className="font-medium text-ink">Frequency:</strong> account-essential
          messages average fewer than five per month. Marketing messages, when subscribed,
          average fewer than four per month.
        </p>
        <p>
          <strong className="font-medium text-ink">Costs:</strong> message and data rates
          may apply, depending on your mobile carrier and plan. Pop Tips does not charge
          you for messages.
        </p>
        <p>
          <strong className="font-medium text-ink">Help:</strong> reply <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm text-ink">HELP</code> to any
          message for assistance. You can also email{' '}
          <a href="mailto:hello@pop.tips" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-jade-500 hover:decoration-jade-500">hello@pop.tips</a>.
        </p>
        <p>
          <strong className="font-medium text-ink">Opt out:</strong> reply{' '}
          <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm text-ink">STOP</code> to
          any SMS message to immediately opt out of future marketing texts. To opt out of
          marketing emails, use the unsubscribe link at the bottom of any marketing email.
          Account-essential messages continue regardless of marketing preferences and can
          only be stopped by closing your account.
        </p>
        <p>
          We comply with the CTIA Short Code Monitoring Handbook and applicable
          U.S. SMS regulations.
        </p>
      </LegalSection>

      <LegalSection
        id="cookies"
        number="06"
        title={<>Cookies &amp; <em className="italic text-jade-500">tracking.</em></>}
      >
        <p>We use a small number of cookies, all in the &ldquo;strictly necessary&rdquo; or &ldquo;analytics&rdquo; category:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="font-medium text-ink">Session cookie</strong> — keeps you
            logged in. Expires when you log out or after extended inactivity.
          </li>
          <li>
            <strong className="font-medium text-ink">Track preference cookie</strong> —
            remembers whether you came in as a tipper, a worker, or a discovery visitor, so
            the site shows you the right experience on return visits. Lifetime: 1 year.
          </li>
          <li>
            <strong className="font-medium text-ink">Analytics cookies</strong> — set by
            Google Analytics 4 and PostHog (see Section 03). These help us understand
            anonymized aggregate behavior across the site.
          </li>
        </ul>
        <p>
          We do not use advertising cookies or sell cookie data to anyone. Most browsers
          let you reject or delete cookies through your settings; doing so may break parts
          of the experience (you wouldn&rsquo;t stay logged in, for instance).
        </p>
      </LegalSection>

      <LegalSection
        id="minors"
        number="07"
        title={<>Anyone under <em className="italic text-jade-500">18.</em></>}
      >
        <p>
          Pop Tips is not directed at people under 18 and we do not knowingly collect
          information from anyone under 18. If you are under 18, please do not create a
          Pop Tips account. If we learn that we have collected information from someone
          under 18, we will delete it.
        </p>
        <p>
          If you&rsquo;re a parent or guardian who believes your child has signed up for
          Pop Tips, email us at{' '}
          <a href="mailto:hello@pop.tips" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-jade-500 hover:decoration-jade-500">hello@pop.tips</a> and
          we&rsquo;ll remove the account.
        </p>
      </LegalSection>

      <LegalSection
        id="your-rights"
        number="08"
        title={<>Your <em className="italic text-jade-500">rights.</em></>}
      >
        <p>
          Depending on where you live, you may have specific legal rights about your data.
          Regardless of where you are, you can ask us to do any of the following at any
          time:
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="font-medium text-ink">Access</strong> — see the data we
            have about you.
          </li>
          <li>
            <strong className="font-medium text-ink">Correct</strong> — fix anything
            that&rsquo;s wrong.
          </li>
          <li>
            <strong className="font-medium text-ink">Delete</strong> — close your account
            and have your personal data removed (some records — like tip history — may be
            retained in aggregate or anonymized form for legal or accounting purposes).
          </li>
          <li>
            <strong className="font-medium text-ink">Export</strong> — get a copy of your
            data in a portable format.
          </li>
          <li>
            <strong className="font-medium text-ink">Object</strong> — opt out of specific
            uses (e.g. marketing communications).
          </li>
        </ul>
        <p>
          To exercise any of these, email{' '}
          <a href="mailto:hello@pop.tips" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-jade-500 hover:decoration-jade-500">hello@pop.tips</a>.
          We respond within 30 days.
        </p>
      </LegalSection>

      <LegalSection
        id="retention"
        number="09"
        title={<>How long we <em className="italic text-jade-500">keep things.</em></>}
      >
        <p>
          We keep your data only as long as we need it to operate the service and meet
          legal obligations:
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            <strong className="font-medium text-ink">Active accounts</strong> — for as long
            as your account is open.
          </li>
          <li>
            <strong className="font-medium text-ink">Closed accounts</strong> — most personal
            data deleted within 30 days of account closure.
          </li>
          <li>
            <strong className="font-medium text-ink">Tip records</strong> — retained in
            anonymized form for accounting and aggregate analytics (no personally
            identifiable information attached).
          </li>
          <li>
            <strong className="font-medium text-ink">Billing records</strong> — retained
            for 7 years as required by US tax law.
          </li>
        </ul>
      </LegalSection>

      <LegalSection
        id="changes"
        number="10"
        title={<>Changes to <em className="italic text-jade-500">this policy.</em></>}
      >
        <p>
          We&rsquo;ll update this page from time to time. The &ldquo;last updated&rdquo;
          date at the top reflects the most recent change. For material changes (anything
          that affects what we collect or who we share with), we&rsquo;ll notify active
          users by email or in-app banner at least 14 days before the change takes effect.
        </p>
      </LegalSection>

      <LegalSection
        id="contact"
        number="11"
        title={<>Get in <em className="italic text-jade-500">touch.</em></>}
      >
        <p>
          Questions, concerns, or anything that doesn&rsquo;t match the experience you
          actually had using Pop Tips?
        </p>
        <p>
          Email{' '}
          <a href="mailto:hello@pop.tips" className="font-medium text-ink underline decoration-line decoration-2 underline-offset-4 transition-colors hover:text-jade-500 hover:decoration-jade-500">hello@pop.tips</a>.
          A real person reads every message.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
