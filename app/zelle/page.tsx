import { PaymentExplainer, ExplainerSection } from '@/components/PaymentExplainer';

export const metadata = {
  title: 'Tipping with Zelle',
  description:
    'How Zelle works with Pop Tips. Free, instant, bank-to-bank. Built into most major US bank apps — no standalone wallet to install.',
};

export default function ZellePage() {
  return (
    <PaymentExplainer
      walletName="Zelle"
      walletNameAccent={<em className="italic text-accent">Zelle</em>}
      lede="Built into most major US bank apps. No standalone wallet to install. Money moves bank-to-bank in minutes, free in both directions. The simplest of the four — with one catch worth knowing about."
    >
      {/* HOW IT WORKS — different framing than the others */}
      <ExplainerSection
        eyebrow="01 · How it works with Pop Tips"
        title={<>Your <em className="italic text-accent">bank app</em> is the wallet.</>}
      >
        <p>
          Zelle isn&rsquo;t a separate app you install (well — there is one, but most people
          don&rsquo;t need it). It&rsquo;s a service built into your existing bank&rsquo;s app.
          Chase, Bank of America, Wells Fargo, Capital One, US Bank, PNC, Citi, and{' '}
          <a
            href="https://www.zellepay.com/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent-dim hover:decoration-accent"
          >
            most others
          </a>{' '}
          all support it natively.
        </p>
        <p>
          <strong className="font-medium text-ink">For tippers:</strong> on a recipient&rsquo;s
          send page, tap the Zelle option. Pop Tips hands off to your bank&rsquo;s Zelle flow
          with the recipient&rsquo;s email or phone pre-filled. You confirm inside your bank
          app. Money moves bank-to-bank in minutes.
        </p>
        <p>
          <strong className="font-medium text-ink">For workers:</strong> register the email or
          phone you want Zelle to use (in your bank&rsquo;s app, under Zelle settings — it&rsquo;s
          a one-time step). Add the same email or phone to your Pop Tips dashboard. Tips
          coming through Zelle hit your checking account directly.
        </p>
      </ExplainerSection>

      {/* FEES */}
      <ExplainerSection
        eyebrow="02 · Fees, plainly"
        title={<><em className="italic text-accent">Zero fees.</em> Both sides.</>}
      >
        <ul className="space-y-3">
          <li>
            <strong className="font-medium text-ink">No fees to send.</strong> Funded by your
            checking account, full stop. No bank charges for using Zelle.
          </li>
          <li>
            <strong className="font-medium text-ink">No fees to receive.</strong> Tips arrive
            in your checking account at face value.
          </li>
          <li>
            <strong className="font-medium text-ink">No instant-transfer fee.</strong> Zelle is
            instant already — there&rsquo;s no slower-but-cheaper option to opt out of.
            (Funds typically arrive in minutes, sometimes up to a few hours for first
            transfers between certain banks.)
          </li>
        </ul>
      </ExplainerSection>

      {/* THE CATCH */}
      <ExplainerSection
        eyebrow="03 · The one catch · daily limits"
        title={<>Your bank decides <em className="italic text-accent">the ceiling.</em></>}
      >
        <p>
          Zelle&rsquo;s daily and weekly send limits aren&rsquo;t set by Zelle — they&rsquo;re
          set by your bank, and they vary wildly:
        </p>
        <ul className="space-y-3">
          <li>
            <strong className="font-medium text-ink">Large banks</strong> (Chase, Bank of
            America, Wells Fargo): typically{' '}
            <span className="money font-semibold text-ink">$2,000–$3,500</span> per day,{' '}
            <span className="money font-semibold text-ink">$10,000–$20,000</span> per month.
          </li>
          <li>
            <strong className="font-medium text-ink">Smaller banks &amp; credit unions:</strong>{' '}
            often <span className="money font-semibold text-ink">$500–$1,000</span> per day.
            Some go as low as <span className="money font-semibold text-ink">$300</span>.
          </li>
          <li>
            <strong className="font-medium text-ink">For tips, this rarely matters</strong> —
            but it&rsquo;s the reason a tipper might occasionally see &ldquo;limit
            exceeded&rdquo; if they had a big day. The fix: send via a different wallet, or
            wait until the next day.
          </li>
        </ul>
        <p>
          Check your specific limits inside your bank&rsquo;s app under Zelle settings, or in
          their fee disclosure. Many banks let you request a temporary limit increase via
          customer support.
        </p>
      </ExplainerSection>

      {/* SETUP */}
      <ExplainerSection
        eyebrow="04 · New to Zelle?"
        title={<>You may already <em className="italic text-accent">have it.</em></>}
      >
        <p>If your bank is one of the major US banks, Zelle is already in their app.</p>
        <ol className="ml-5 list-decimal space-y-2">
          <li>Open your bank&rsquo;s mobile app or website.</li>
          <li>
            Look for &ldquo;Send Money with Zelle&rdquo; or just &ldquo;Zelle&rdquo; in the
            transfer menu.
          </li>
          <li>
            Register your email or phone — this is the identifier you&rsquo;ll give Pop Tips.
            (You can use either; many people use email because it&rsquo;s easy to remember.)
          </li>
          <li>
            That&rsquo;s it. No separate password, no separate balance. Your bank checking
            account is the Zelle account.
          </li>
        </ol>
        <p>
          If your bank doesn&rsquo;t support Zelle yet (uncommon at this point), download the
          standalone{' '}
          <a
            href="https://www.zellepay.com/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent-dim hover:decoration-accent"
          >
            Zelle app
          </a>{' '}
          and link a debit card from a supported issuer.
        </p>
      </ExplainerSection>
    </PaymentExplainer>
  );
}
