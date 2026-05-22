# Slice 1 — Core Transaction Loop (setup + test)

This slice makes the heart of Pop Tips real: a recipient exists in Postgres,
their profile renders from real data, and a customer can tap an app to get
deep-linked into Venmo / Cash App / PayPal with the amount pre-filled — and
the tip is logged. Zelle is fully removed (three rails now).

Verified in CI: `tsc --noEmit` clean, `next build` compiles all routes.

---

## What changed

**New files**
- `lib/db/schema.ts` — full Drizzle schema (recipients, recipient_payment_apps, tippers, businesses, properties, tip_events). The whole MVP's tables, so later slices add behavior not migrations-of-regret.
- `lib/db/index.ts` — lazy Neon + Drizzle connection (won't crash builds when env is absent).
- `lib/db/recipients.ts` — `getRecipientByHandle` (read), `createRecipient` (write + QR), `generateAndStoreQr`.
- `lib/deep-links.ts` — Venmo / Cash App / PayPal web-intent URL builders + handle normalization. **The architectural core.**
- `lib/payment-apps.ts` — single source of truth for the three rails.
- `app/api/tips/route.ts` — `POST` logs a tip event (`initiated`).
- `app/api/recipients/route.ts` — `POST` the recipient write path (handle validation + uniqueness + apps + QR).

**Rewired**
- `app/[handle]/page.tsx` — reads the real recipient; `notFound()` if missing; renders real name/role/message/photo + the recipient's actual app badges.
- `app/[handle]/send/page.tsx` — reads the recipient; passes their real apps to the form.
- `components/SendForm.tsx` — builds real deep links, logs the tip, hands off to the chosen app.

**Zelle scrubbed** across home, signup, terms, privacy, tracks, dashboard mock-data, events registry, and the send/profile flows. The `/zelle` explainer page was deleted. `zelle` stays in `reserved-handles.ts` (defensive — nobody can claim it).

**Deps added**: `qrcode`, `@vercel/blob`, `stripe` (staged for Slice 3), `zod`, `@types/qrcode`.

---

## Setup

```bash
npm install
```

Set env vars (Vercel project settings, or `.env.local` for local dev) — see `.env.example`. The two that matter for this slice:

- `POSTGRES_URL` — from the Vercel Postgres integration (required)
- `BLOB_READ_WRITE_TOKEN` — from the Vercel Blob integration (required for QR PNGs; without it recipients still create, QR is just null)
- `NEXT_PUBLIC_APP_ORIGIN` — e.g. `https://pop.tips` (defaults to that if unset)

Create the tables:

```bash
npm run db:push
```

(`db:generate` then `db:push` if you prefer explicit migrations.)

---

## Test the full loop

**1. Create a demo recipient** (exercises the real write path + QR generation):

```bash
curl -X POST https://YOUR-DEPLOY-URL/api/recipients \
  -H "Content-Type: application/json" \
  -d '{
    "handle": "rhea",
    "displayName": "Rhea Patel",
    "role": "Barista · Blue Bottle",
    "message": "Hi, thanks for stopping by. Really appreciate you.",
    "workplaceName": "Blue Bottle Coffee",
    "workplaceAddress": "1 Ferry Building, San Francisco, CA",
    "workplacePhone": "+1 415 555 0100",
    "apps": [
      { "app": "venmo",   "appHandle": "@rhea-patel", "isPrimary": true },
      { "app": "cashapp", "appHandle": "$rheapatel" },
      { "app": "paypal",  "appHandle": "paypal.me/rheapatel" }
    ]
  }'
```

Expect: `{ "ok": true, "handle": "rhea", "profileUrl": "...", "qrUrl": "..." }`

**2. Visit the profile**: `https://YOUR-DEPLOY-URL/rhea`
You should see Rhea's real name, role, message, and three app badges (Venmo, Cash App, PayPal).

**3. Send a tip**: tap **Send a tip** → pick `$20` → tap **Venmo**.
On a phone, Venmo opens pre-filled with `@rhea-patel` and `$20`. A `tip_events` row is written with status `initiated`.

**4. Confirm it logged**: query Postgres (`npm run db:studio`) → `tip_events` should show the row.

---

## Deep-link formats (for reference)

| App | URL built | Amount | Note |
|---|---|---|---|
| Venmo | `https://venmo.com/?txn=pay&recipients=HANDLE&amount=AMT&note=NOTE` | yes | yes |
| Cash App | `https://cash.app/$CASHTAG/AMT` | yes | no |
| PayPal | `https://paypal.me/HANDLE/AMTUSD` | yes | no |

All are web-intent URLs: they open the native app on mobile and the web flow on desktop. Handle normalization strips `@`, `$`, and `paypal.me/` so workers can paste their handle however they think of it.

---

## Next slices

- **Slice 2** — GHL signup webhook → profile-completion → photo upload (Blob) → wires the live signup so you stop seeding via curl.
- **Slice 3** — Stripe vault, 3-free-then-$9.99/yr activation, 3.5% accrual.
- **Slice 4** — dashboards read real `tip_events` instead of placeholder data.
- **Slice 5** — corp billing (per-property subscriptions).
- **Slice 6** — recipient confirmation + 7-day auto-confirm + monthly billing cron.
