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
    default: 'Pop Tips — Empowering the Appreciation Economy',
    template: '%s · Pop Tips',
  },
  description:
    'Pop Tips is the direct line between a moment of great service and the person who gave it. 100% to the worker. Instantly.',
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
    title: 'Pop Tips — Empowering the Appreciation Economy',
    description: '100% to the worker. Instantly.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pop Tips — Empowering the Appreciation Economy',
    description: '100% to the worker. Instantly.',
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

  return (
    <html lang="en" data-track="neutral" className={fontVars}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
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
