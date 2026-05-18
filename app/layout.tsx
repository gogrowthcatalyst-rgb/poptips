import type { Metadata, Viewport } from 'next';
import { Fraunces, Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { TrackProvider, buildNoFlashScript } from '@/lib/track';
import { PostHogProvider, GA } from '@/lib/analytics';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import './globals.css';

/* =====================================================================
   FONTS — Fraunces / Geist / Geist Mono via next/font/google.
   ===================================================================== */
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

/* =====================================================================
   METADATA + PWA HOOKS
   ===================================================================== */
export const metadata: Metadata = {
  title: {
    default: 'Pop Tips — One-to-one tipping, directly.',
    template: '%s · Pop Tips',
  },
  description:
    'Pop Tips enables one-to-one tipping, directly. Empowering the appreciation economy — 100% to the worker, instantly.',
  applicationName: 'Pop Tips',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Pop Tips',
    statusBarStyle: 'default',
  },
  openGraph: {
    type: 'website',
    siteName: 'Pop Tips',
    title: 'Pop Tips — One-to-one tipping, directly.',
    description: 'Empowering the appreciation economy. 100% to the worker, instantly.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pop Tips — One-to-one tipping, directly.',
    description: 'Empowering the appreciation economy. 100% to the worker, instantly.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FBF7F1',
};

/* =====================================================================
   ROOT LAYOUT
   - No-flash script in <head> paints the cookie's track pre-hydration.
   - TrackProvider wraps everything so trackId is readable in nested
     analytics page-view events.
   - PostHogProvider is wrapped in <Suspense> because useSearchParams()
     is a suspense boundary in the App Router.
   - flex-col body keeps the footer pinned on short pages.
   ===================================================================== */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const noFlash = buildNoFlashScript();
  const fontVars = `${fraunces.variable} ${geist.variable} ${geistMono.variable}`;

  // Inline script — checks PWA standalone state on every page load and sets
  // localStorage flag. Catches iOS users who installed previously and are
  // now opening the app from their home screen icon. Synchronous, no flash.
  const pwaDetect = `
    try {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        window.localStorage.setItem('pop_tips_installed', '1');
      } else if (window.navigator && window.navigator.standalone === true) {
        window.localStorage.setItem('pop_tips_installed', '1');
      }
    } catch (e) {}
  `.trim();

  // Service worker registration — required for Chrome on Android to fire
  // beforeinstallprompt. Loads after window 'load' so it doesn't compete
  // with the main render path. The worker itself is minimal (no caching
  // strategy yet); its job right now is just to satisfy install criteria.
  const swRegister = `
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').catch(function(err) {
          console.warn('SW registration failed:', err);
        });
      });
    }
  `.trim();

  return (
    <html lang="en" data-track="neutral" className={fontVars}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
        <script dangerouslySetInnerHTML={{ __html: pwaDetect }} />
        <script dangerouslySetInnerHTML={{ __html: swRegister }} />
      </head>
      <body className="flex min-h-screen flex-col bg-paper font-body text-ink">
        <TrackProvider>
          <Suspense fallback={null}>
            <PostHogProvider>
              <SiteHeader />
              <div className="flex-1">{children}</div>
              <SiteFooter />
            </PostHogProvider>
          </Suspense>
        </TrackProvider>
        <GA />
      </body>
    </html>
  );
}
