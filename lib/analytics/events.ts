import type { TrackId } from '@/lib/track';

/**
 * Every event Pop Tips fires has its name and payload shape declared here.
 *
 * Why a registry instead of free-form `track('whatever', anything)`:
 *   - TypeScript catches typos: `track('tip_satrted', ...)` won't compile
 *   - Payload shape is enforced: forgetting `handle` on a profile view fails
 *   - Single source of truth when reviewing what data we're collecting
 *   - Easy to audit when removing or renaming events
 *
 * Naming convention: snake_case verbs in past tense (`cta_clicked`, not
 * `clickCTA`). Matches PostHog and GA4 conventions.
 */
export type EventMap = {
  /** Any of the marketing CTAs were clicked */
  cta_clicked: {
    source: 'home_hero' | 'home_pricing' | 'header_nav' | 'footer' | 'profile' | 'not_found';
    intent: 'tip' | 'receive' | 'dashboard' | 'home' | 'wiki' | 'other';
    track: TrackId;
  };

  /** User toggled the track preview or a force-track fired */
  track_changed: {
    from: TrackId;
    to: TrackId;
    via: 'toggle' | 'cta' | 'force' | 'cookie';
  };

  /** Profile page (the QR landing) loaded */
  profile_viewed: {
    handle: string;
    via: 'qr' | 'link' | 'direct' | 'unknown';
  };

  /** User clicked "Send a tip" on a profile, entering the picker */
  tip_send_started: {
    handle: string;
  };

  /** User picked an amount in the picker */
  tip_amount_selected: {
    handle: string;
    amount: number;
    method: 'preset' | 'custom';
  };

  /** User picked a payment app and we deep-linked out */
  tip_app_opened: {
    handle: string;
    app: 'venmo' | 'cashapp' | 'paypal';
    amount: number | null;
  };

  /** Recipient signup form was loaded (skeleton-stage; real fire in Session 3) */
  signup_form_viewed: {
    role: 'tipper' | 'recipient';
  };

  /** Recipient signup form was submitted (Session 3) */
  signup_completed: {
    role: 'tipper' | 'recipient';
  };

  /** Generic page view — fired automatically on every navigation */
  page_viewed: {
    path: string;
    track: TrackId;
  };

  /**
   * The user installed Pop Tips as a PWA on their device.
   *
   * On Android Chrome/Edge, the browser fires `appinstalled` reliably; we
   * catch it in InstallPrompt and emit this event with source='inline_prompt'.
   *
   * On iOS Safari there is no install event. Instead we detect installation
   * after-the-fact on the next visit: when `window.navigator.standalone === true`
   * or `display-mode: standalone`, we know they launched from the home screen
   * icon. We emit with source='detected_on_visit' so the funnel reports the
   * install retroactively.
   */
  pwa_installed: {
    platform: 'ios' | 'android' | 'desktop' | 'other';
    source: 'inline_prompt' | 'footer_link' | 'detected_on_visit';
  };
};

export type EventName = keyof EventMap;
