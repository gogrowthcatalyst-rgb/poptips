'use client';

import { useEffect, useState } from 'react';
import { Smartphone, Download, X } from '@/components/icons';
import { track } from '@/lib/analytics';

/** Storage keys — kept centrally so other code can read installed state */
export const PWA_INSTALLED_KEY = 'pop_tips_installed';
export const PWA_DISMISSED_KEY = 'pop_tips_install_dismissed';

/**
 * Detect whether the visitor's device platform is iOS, Android, desktop, or other.
 * Used both to pick the right install copy AND to attach platform to analytics.
 */
function detectPlatform(): 'ios' | 'android' | 'desktop' | 'other' {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  // Desktop: not strictly relevant for install (PWAs install on desktop too in Chrome/Edge,
  // but we don't surface the prompt on desktop — they have a browser address bar with
  // an install affordance already).
  if (/macintosh|windows|linux/.test(ua) && !/mobile/.test(ua)) return 'desktop';
  return 'other';
}

/**
 * Synchronously check whether Pop Tips is currently running as an installed PWA.
 * Two ways an app can be standalone:
 *   - display-mode: standalone (Android Chrome, desktop Chrome, modern iOS)
 *   - window.navigator.standalone (legacy iOS Safari API)
 *
 * If true on first read, we silently record the install — useful for iOS users
 * who installed previously and are just now coming back via the home-screen icon.
 */
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  // Legacy iOS — non-standard, present on Safari only
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window.navigator as any).standalone === true) return true;
  return false;
}

/**
 * Inline install card. Renders ONLY when:
 *   - the visitor is on a mobile-ish platform (iOS or Android)
 *   - the app is NOT already installed (per localStorage flag)
 *   - the visitor hasn't dismissed the prompt in the last 30 days
 *
 * The card is meant to be embedded in marketing pages (home, signup) — it's
 * dismissible, non-blocking, brand-styled.
 *
 * The SiteFooter link triggers a separate behavior: it shows the prompt
 * imperatively even if the visitor previously dismissed it. (Different
 * intent — they tapped a link asking how to install.)
 */
export function InstallPrompt({ forceOpen = false }: { forceOpen?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'other'>('other');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredEvent, setDeferredEvent] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const p = detectPlatform();
    setPlatform(p);

    // If we're already running as an installed PWA, record it silently
    // (catches iOS users on their first home-screen launch after install).
    if (isStandalone()) {
      const wasFlagged = localStorage.getItem(PWA_INSTALLED_KEY) === '1';
      localStorage.setItem(PWA_INSTALLED_KEY, '1');
      if (!wasFlagged) {
        track('pwa_installed', { platform: p, source: 'detected_on_visit' });
      }
      return;
    }

    // Otherwise, decide whether to show the prompt
    const installed = localStorage.getItem(PWA_INSTALLED_KEY) === '1';
    const dismissedAt = parseInt(localStorage.getItem(PWA_DISMISSED_KEY) ?? '0', 10);
    const dismissedRecently = Date.now() - dismissedAt < 30 * 24 * 60 * 60 * 1000; // 30 days

    if (forceOpen) {
      setVisible(true);
    } else if (!installed && !dismissedRecently && (p === 'ios' || p === 'android')) {
      setVisible(true);
    }

    // Android: capture the beforeinstallprompt event so we can trigger
    // the native install dialog on user action.
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredEvent(e);
    };
    // Capture appinstalled — fires after a successful install on Android
    const onInstalled = () => {
      localStorage.setItem(PWA_INSTALLED_KEY, '1');
      track('pwa_installed', { platform: p, source: 'inline_prompt' });
      setVisible(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [forceOpen]);

  const dismiss = () => {
    localStorage.setItem(PWA_DISMISSED_KEY, Date.now().toString());
    setVisible(false);
  };

  const triggerInstall = async () => {
    if (deferredEvent) {
      // Android native flow
      deferredEvent.prompt();
      const { outcome } = await deferredEvent.userChoice;
      if (outcome === 'accepted') {
        // appinstalled event handler will record the flag
      }
      setDeferredEvent(null);
    }
    // For iOS, there's no native install API — the visible card shows the
    // step-by-step Share→Add to Home Screen copy and the user has to act on it.
    // (We don't dismiss the card on tap since they need to read the instructions.)
  };

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Pop Tips as an app"
      className="relative my-6 overflow-hidden rounded-2xl border border-jade-100 bg-gradient-to-br from-jade-50 via-paper to-paper p-5 shadow-lift md:p-6"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-jade-100 opacity-50 blur-2xl"
      />

      {/* Dismiss */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-ink-faint transition-colors hover:bg-jade-50 hover:text-ink"
      >
        <X className="h-4 w-4" strokeWidth={1.5} />
      </button>

      <div className="relative flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-jade-500 text-paper">
          <Smartphone className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <p className="mb-1 font-mono text-xs font-medium uppercase tracking-wider2 text-jade-700">
            One-tap install
          </p>
          <h3 className="font-display text-xl font-medium leading-snug text-ink md:text-2xl">
            Get Pop Tips on your <em className="italic text-jade-500">home screen.</em>
          </h3>

          {platform === 'ios' && (
            <p className="mt-2 text-sm leading-relaxed text-ink-dim md:text-base">
              Tap the <strong className="font-medium text-ink">Share</strong> button below
              (the square with the arrow), then choose{' '}
              <strong className="font-medium text-ink">Add to Home Screen</strong>.
              You&rsquo;ll get an app icon that opens Pop Tips full-screen, no browser bar.
            </p>
          )}
          {platform === 'android' && (
            <p className="mt-2 text-sm leading-relaxed text-ink-dim md:text-base">
              Pop Tips works offline-first as an installed app on your home screen.
              Tap below to install — takes one second.
            </p>
          )}
          {(platform === 'desktop' || platform === 'other') && (
            <p className="mt-2 text-sm leading-relaxed text-ink-dim md:text-base">
              Look for an &ldquo;Install&rdquo; option in your browser&rsquo;s address bar,
              or visit pop.tips on your phone for the easiest install.
            </p>
          )}

          {platform === 'android' && deferredEvent && (
            <button
              type="button"
              onClick={triggerInstall}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-jade-500 px-5 py-2.5 text-sm font-medium text-paper shadow-halo-jade transition-all duration-200 hover:-translate-y-px hover:bg-jade-700 active:scale-95"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              Install the app
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
