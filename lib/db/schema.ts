/**
 * Pop Tips — Drizzle schema (Postgres / Neon).
 *
 * One unified schema across all three actors: recipients (workers),
 * tippers (customers), and businesses (organizations on the business plan).
 * They reference each other — this is not three siloed systems.
 *
 * Slice 1 wires the transaction-loop subset live: recipients,
 * recipient_payment_apps, tip_events. The rest (tippers billing fields,
 * businesses, properties) are defined now so the foundation is correct
 * and later slices only add behavior, never migrations-of-regret.
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// The three supported payment rails. Zelle and Apple Pay are deliberately
// excluded (no public deep-link). Single source of truth for the enum-ish set.
export const PAYMENT_APPS = ['venmo', 'cashapp', 'paypal'] as const;
export type PaymentApp = (typeof PAYMENT_APPS)[number];

export const BUSINESS_TIERS = [
  'smb_1',
  'smb_2',
  'ent_standard',
  'ent_premium',
] as const;
export type BusinessTier = (typeof BUSINESS_TIERS)[number];

export const TIP_STATUS = ['initiated', 'confirmed', 'auto_confirmed'] as const;
export type TipStatus = (typeof TIP_STATUS)[number];

/* ─────────────────────────── BUSINESSES ─────────────────────────── */

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  tier: text('tier').$type<BusinessTier>(),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  ghlContactId: text('ghl_contact_id'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/* ─────────────────────────── PROPERTIES ─────────────────────────── */

export const properties = pgTable(
  'properties',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    businessId: uuid('business_id')
      .references(() => businesses.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    address: text('address'),
    qrUrl: text('qr_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: uniqueIndex('properties_slug_idx').on(t.slug),
    businessIdx: index('properties_business_idx').on(t.businessId),
  }),
);

/* ─────────────────────────── RECIPIENTS ─────────────────────────── */

export const recipients = pgTable(
  'recipients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    handle: text('handle').notNull(),
    displayName: text('display_name').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    phone: text('phone'),
    email: text('email'),
    role: text('role'),
    photoUrl: text('photo_url'),
    message: text('message'),

    // Workplace affiliation — required at signup (identity verification +
    // workplace mapping). Nullable here because seed/admin paths may omit.
    workplaceName: text('workplace_name'),
    workplaceAddress: text('workplace_address'),
    workplacePhone: text('workplace_phone'),
    workplaceBusinessId: uuid('workplace_business_id').references(
      () => businesses.id,
      { onDelete: 'set null' },
    ),

    ghlContactId: text('ghl_contact_id'),
    qrUrl: text('qr_url'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    handleIdx: uniqueIndex('recipients_handle_idx').on(t.handle),
  }),
);

/* ─────────────────── RECIPIENT PAYMENT APPS ─────────────────────── */

export const recipientPaymentApps = pgTable(
  'recipient_payment_apps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recipientId: uuid('recipient_id')
      .references(() => recipients.id, { onDelete: 'cascade' })
      .notNull(),
    app: text('app').$type<PaymentApp>().notNull(),
    /** Their username / cashtag / paypal.me handle (without the @ or $ prefix) */
    appHandle: text('app_handle').notNull(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
  },
  (t) => ({
    recipientIdx: index('rpa_recipient_idx').on(t.recipientId),
    // A recipient can list each app at most once.
    recipientAppIdx: uniqueIndex('rpa_recipient_app_idx').on(t.recipientId, t.app),
  }),
);

/* ─────────────────────────── TIPPERS ─────────────────────────────── */

export const tippers = pgTable(
  'tippers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    email: text('email'),
    phone: text('phone'),
    ghlContactId: text('ghl_contact_id'),
    /** Self-reported apps the tipper already uses — drives the multi-rail nudge */
    usesApps: text('uses_apps').array(),

    // Acquisition tracking — drives the first-year fee waiver when a tipper
    // signs up through a business's property QR (pop.tips/join/{slug}).
    acquisitionBusinessId: uuid('acquisition_business_id').references(
      () => businesses.id,
      { onDelete: 'set null' },
    ),
    firstYearWaived: boolean('first_year_waived').default(false).notNull(),
    signupDate: timestamp('signup_date', { withTimezone: true }).defaultNow().notNull(),
    anniversaryDate: timestamp('anniversary_date', { withTimezone: true }),

    // Billing state (Slice 3 lights these up via Stripe).
    freeTipsUsed: integer('free_tips_used').default(0).notNull(),
    activated: boolean('activated').default(false).notNull(),
    stripeCustomerId: text('stripe_customer_id'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: index('tippers_email_idx').on(t.email),
  }),
);

/* ─────────────────────────── TIP EVENTS ──────────────────────────── */

export const tipEvents = pgTable(
  'tip_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    recipientId: uuid('recipient_id')
      .references(() => recipients.id, { onDelete: 'cascade' })
      .notNull(),
    /** Denormalized for fast lookups / display without a join */
    recipientHandle: text('recipient_handle').notNull(),
    /** Null for anonymous tippers (not signed in) */
    tipperId: uuid('tipper_id').references(() => tippers.id, {
      onDelete: 'set null',
    }),
    amountCents: integer('amount_cents').notNull(),
    app: text('app').$type<PaymentApp>().notNull(),
    note: text('note'),
    status: text('status').$type<TipStatus>().default('initiated').notNull(),
    initiatedAt: timestamp('initiated_at', { withTimezone: true }).defaultNow().notNull(),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    recipientIdx: index('tip_events_recipient_idx').on(t.recipientId),
    statusIdx: index('tip_events_status_idx').on(t.status),
  }),
);

/* ─────────────────────────── MAGIC TOKENS ────────────────────────── */

/**
 * One-time, short-lived tokens for passwordless magic-link auth.
 * Stored in Postgres (not Redis) to keep the auth critical path on a single,
 * already-proven datastore. Single-use: deleted on consume. TTL enforced by
 * expiresAt (we never honor an expired row).
 */
export const magicTokens = pgTable(
  'magic_tokens',
  {
    token: text('token').primaryKey(),
    userId: uuid('user_id').notNull(),
    role: text('role').notNull(), // 'recipient' | 'tipper'
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index('magic_tokens_user_idx').on(t.userId),
  }),
);

/* ─────────────────────────── INFERRED TYPES ──────────────────────── */

export type Recipient = typeof recipients.$inferSelect;
export type NewRecipient = typeof recipients.$inferInsert;
export type RecipientPaymentApp = typeof recipientPaymentApps.$inferSelect;
export type NewRecipientPaymentApp = typeof recipientPaymentApps.$inferInsert;
export type Tipper = typeof tippers.$inferSelect;
export type NewTipper = typeof tippers.$inferInsert;
export type Business = typeof businesses.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type TipEvent = typeof tipEvents.$inferSelect;
export type NewTipEvent = typeof tipEvents.$inferInsert;
export type MagicToken = typeof magicTokens.$inferSelect;
export type NewMagicToken = typeof magicTokens.$inferInsert;
