/**
 * Industries — the SINGLE shared taxonomy behind "tip by industry" analytics.
 *
 * Both sides use this one list: a recipient's workplace industry and a tipper's
 * "what do you tip most" both resolve to the same buckets, so the two sides
 * reconcile and corporate rollups (a hotel group, a salon chain) actually join.
 * The recipient's finer ROLE (server vs bartender) is a separate axis captured
 * elsewhere; this is the industry/sector axis.
 *
 * Stored value is the SLUG (stable). The label is display-only — re-wording a
 * label never breaks historical analytics because the slug doesn't move.
 *
 * Power of Ten: tiny pure helpers, explicit returns, guarded inputs, no loops
 * beyond a fixed-size constant list, no I/O.
 */

export interface Industry {
  /** Stable identifier persisted to the DB — never reword these. */
  slug: string;
  /** Human label shown in the dropdown and the CRM. */
  label: string;
}

/** Canonical list. Order is the display order. "other" is always last. */
export const INDUSTRIES: readonly Industry[] = [
  { slug: 'restaurant_bar', label: 'Restaurant & Bar' },
  { slug: 'cafe_coffee', label: 'Café & Coffee Shop' },
  { slug: 'food_delivery', label: 'Food & Grocery Delivery' },
  { slug: 'rideshare_taxi', label: 'Rideshare & Taxi' },
  { slug: 'hotel_hospitality', label: 'Hotel & Hospitality' },
  { slug: 'salon_spa', label: 'Salon, Spa & Personal Care' },
  { slug: 'home_field_services', label: 'Home & Field Services' },
  { slug: 'valet_parking', label: 'Valet & Parking' },
  { slug: 'tours_recreation', label: 'Tours & Recreation' },
  { slug: 'events_entertainment', label: 'Events & Entertainment' },
  { slug: 'health_fitness', label: 'Health & Fitness' },
  { slug: 'other', label: 'Other' },
] as const;

/** The slug a user must pick when nothing else fits (pairs with a free-text). */
export const OTHER_SLUG = 'other';

/**
 * Slugs as a non-empty string tuple — the exact shape `z.enum(...)` wants, so
 * the API can validate the industry against this list without a second source.
 */
export const INDUSTRY_SLUGS = INDUSTRIES.map((i) => i.slug) as [string, ...string[]];

const LABEL_BY_SLUG: Readonly<Record<string, string>> = Object.fromEntries(
  INDUSTRIES.map((i) => [i.slug, i.label]),
);

/** True when `value` is one of our known industry slugs. */
export function isIndustrySlug(value: unknown): value is string {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(LABEL_BY_SLUG, value);
}

/**
 * Human label for a slug. For "other", prefer the user's free-text when given.
 * Falls back to the raw slug only if it's somehow unknown (defensive).
 */
export function industryLabel(slug: string, otherText?: string | null): string {
  if (slug === OTHER_SLUG) {
    const trimmed = (otherText ?? '').trim();
    return trimmed.length > 0 ? trimmed : 'Other';
  }
  return LABEL_BY_SLUG[slug] ?? slug;
}
