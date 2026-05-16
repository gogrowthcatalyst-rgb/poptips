# Pop Tips

**Empowering the appreciation economy.** A direct-line tipping PWA. 100% to the worker. Instantly.

Pop Tips never touches tip money — every tip routes peer-to-peer through the recipient's preferred app (Venmo, Cash App, PayPal, Zelle). Tippers pay $5 setup + 3% per tip after a 3-tip free trial. Recipients are always free.

---

## Stack

| Layer            | Choice                                            |
| ---------------- | ------------------------------------------------- |
| Framework        | Next.js 15 · App Router                           |
| Styling          | Tailwind CSS · skin-driven via CSS vars           |
| Hosting          | Vercel Pro                                        |
| CRM / forms / SMS| GoHighLevel                                       |
| Database         | Vercel Postgres (Neon driver) · Drizzle ORM       |
| Cache / sessions | Upstash Redis (Vercel KV)                         |
| Photo storage    | Vercel Blob _(Phase 1, item 3)_                   |
| Payments         | Stripe vault + monthly batched billing            |
| Tip flow         | P2P deep links · Pop Tips never holds funds       |
| Analytics        | GA4 + PostHog · typed event registry              |
| Wiki             | Separate cPanel host at `wiki.pop.tips`           |

---

## Phase 1 build queue

1. **✅ Skeleton + Track Engine**
2. **✅ Page shells + URL re-shape + Analytics**
3. **✅ UI/UX pop pass** — real logos, motion language, audience portraits, celebration block, big photos, proper money treatment, OG image
4. GHL signup forms (with photo upload, handle picker, magic-link auth)
5. Drizzle schema + tip recording + `/api/tips`
6. Stripe `SetupIntent` + activation flow + 3-tip free trial + $5 activation
7. Recipient confirmation + 7-day auto-confirm
8. Cron + monthly batched billing run
9. Sounds + share kit + final polish

**Deferred to v.X:** Uber-style ratings, multilingual shell (Spanish first).

---

## Routes

| Path                  | Track forced | Status                                       |
| --------------------- | ------------ | -------------------------------------------- |
| `/`                   | _cookie_     | Hero (PopCircle), audience portraits, how-it-works, celebration block, payout apps, pricing, track preview |
| `/signup-tipper`      | tipper       | Hero, three-promise strip, GHL form mount placeholder |
| `/signup-recipient`   | recipient    | Hero, three-promise strip, handle preview, GHL form mount placeholder |
| `/dashboard`          | recipient    | Empty state — QR slot (with halo pulse), big-display lifetime, payout app picker, recent tips empty |
| `/[handle]`           | tipper       | Public profile — BIG photo placeholder, name, message, "Send a tip" CTA, soft "claim your own" pitch |
| `/[handle]/send`      | tipper       | The send page — compressed identity, amount picker, app picker |
| `*` (not-found)       | _cookie_     | On-brand 404 with iconmark anchor            |

**Reserved handles** — see `lib/reserved-handles.ts`. Routing layer + signup form share one source of truth.

---

## Design system

### Track Engine

One CSS variable triplet swaps on `:root` per track. Inline `<head>` script paints pre-hydration; no FOUC.

| Track       | Lean           | Voice       |
| ----------- | -------------- | ----------- |
| `neutral`   | Ink-shaded     | Visitor     |
| `tipper`    | Coral · warmth | Appreciator |
| `recipient` | Jade · depth   | Earner      |

### Token surface

| Token              | Constant? | Purpose                            |
| ------------------ | --------- | ---------------------------------- |
| `--paper`          | yes       | Main warm background               |
| `--surface`        | yes       | Cards, raised surfaces             |
| `--surface-2`      | yes       | Inset / quiet zones                |
| `--line`           | yes       | Strong divider                     |
| `--line-soft`      | yes       | Quiet divider                      |
| `--ink`            | yes       | Primary text                       |
| `--ink-dim`        | yes       | Secondary text                     |
| `--ink-faint`      | yes       | Tertiary, captions                 |
| **`--accent`**     | **swaps** | Track primary                      |
| **`--accent-dim`** | **swaps** | Track hover / depth                |
| **`--accent-glow`**| **swaps** | Track halo / focus / highlight     |
| `--signal`         | yes       | Celebration moments (gold)         |

Plus persistent direct colors (`coral-*`, `jade-*`, `gold-*`) for components that need to show *both* tracks at once — the home audience portraits, the celebration block.

### Motion language

Every motion answers a question; nothing is decoration. All animations honor `prefers-reduced-motion`.

| Animation        | Purpose                                            |
| ---------------- | -------------------------------------------------- |
| `reveal-up`      | Section enter on scroll (via `<Reveal>` component) |
| `pop-in`         | Spring scale-in for hero / confirmations           |
| `halo-pulse`     | QR slot, active surfaces — quiet "this is alive"   |
| `confetti-burst` | Celebration block — coral/gold/jade/coral-100      |
| `caret-blink`    | Typewriter handle preview                          |
| `drift-slow`     | Decorative SVG (PopCircle background)              |

### Money treatment

- **Inline** (body text, lists): `<span className="money font-semibold text-ink">$20</span>` — Geist Mono, tabular nums.
- **Display** (hero, dashboard cards): `<Money amount={20} size="xl" />` — italic Fraunces with mono `$` superscript in accent color.

### Logos

All variants in `public/logos/`. The `<Logo>` component picks the right asset by variant:

| Variant      | Where it's used                                      |
| ------------ | ---------------------------------------------------- |
| `h`          | Header (32px), home footer (36px) — color horizontal |
| `h-dark`     | Footer brand block (color, slightly darker palette)  |
| `h-mono`     | (available, currently unused)                        |
| `h-white`    | Celebration block (28px, on dark surface)            |
| `icon`       | (available — color square)                           |
| `icon-mono`  | Empty states, profile bottom pitch, 404 (low opacity)|
| `icon-white` | (available, for dark surfaces)                       |

To replace any logo: drop a same-named PNG into `public/logos/` and the component picks it up.

---

## Open Graph card

`app/opengraph-image.tsx` generates a 1200x630 PNG on demand using Next 15's built-in `next/og`. Copy:

> **POWERING THE APPRECIATION ECONOMY** *(coral, mono uppercase)*  
> **Empowering the appreciation economy.** *(huge italic Fraunces)*  
> 100% to the worker. Instantly.

When sharing any pop.tips URL on iMessage / Slack / Twitter / LinkedIn, this is what renders.

---

## Analytics

GA4 + PostHog with a typed event registry in `lib/analytics/events.ts`. Both no-op cleanly if their env vars are missing. Wire keys in Vercel project settings to start collecting.

```tsx
import { track } from '@/lib/analytics';

track('cta_clicked', { source: 'home_hero', intent: 'tip', track: 'neutral' });
```

---

## Deploy (Vercel-first, no terminal)

1. Upload this repo to GitHub via the web UI.
2. In Vercel: **New Project → Import Git Repository → pop-tips**. Framework preset auto-detects.
3. Click **Deploy**. The build succeeds with no env vars set.
4. Point the `pop.tips` apex DNS at the Vercel deployment — see Vercel's domain setup wizard for the CNAME / A record values.
5. Add env vars from `.env.example` as you reach each Phase 1 milestone.

---

*Pop Tips · Phase 1 · Sessions 1 + 2 + 2.5 · 2026-05-10*
