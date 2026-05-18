// Pop Tips service worker — minimal, install-eligible only.
//
// This file exists so Chrome on Android will fire the
// `beforeinstallprompt` event. Without a registered service worker
// that handles `fetch`, Chrome considers a site not installable
// regardless of manifest correctness.
//
// We're NOT implementing offline-first caching yet — that's a
// future task once we have stable bundle paths and a strategy
// for which routes need to work offline. For now this is the
// minimum surface area required by the PWA install criteria.

self.addEventListener('install', (event) => {
  // Skip the typical "waiting" phase — new SW activates immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all clients (tabs) on first activation
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through. Required for install eligibility but doesn't
  // intercept or cache anything yet. Future: implement a
  // network-first-with-cache-fallback strategy for app shell routes.
});
