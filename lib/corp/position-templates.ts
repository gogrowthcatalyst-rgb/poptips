/**
 * Starter position rosters, keyed by the shared industry slug. On business
 * provisioning we seed `business_positions` from the matching template so the
 * staff-signup dropdown isn't empty; the admin can edit the roster afterward.
 *
 * Positions are normalized PER BUSINESS (industry stays the global taxonomy),
 * so these are just sensible defaults — not a fixed global list. Unknown / no
 * match falls back to DEFAULT.
 */

export const DEFAULT_POSITIONS = ['Staff', 'Lead', 'Manager'];

export const POSITION_TEMPLATES: Record<string, string[]> = {
  restaurant_bar: ['Server', 'Bartender', 'Host', 'Busser', 'Food runner', 'Kitchen', 'Manager'],
  cafe_coffee: ['Barista', 'Cashier', 'Shift lead', 'Baker', 'Manager'],
  food_delivery: ['Driver', 'Dispatcher', 'Packer'],
  rideshare_taxi: ['Driver', 'Dispatcher'],
  hotel_hospitality: ['Front desk', 'Concierge', 'Bellhop', 'Housekeeping', 'Valet', 'Restaurant', 'Pool & cabanas', 'Grounds'],
  salon_spa: ['Stylist', 'Colorist', 'Nail tech', 'Esthetician', 'Massage therapist', 'Front desk'],
  home_field_services: ['Technician', 'Installer', 'Crew lead', 'Dispatcher'],
  valet_parking: ['Valet', 'Lead valet', 'Cashier'],
  tours_recreation: ['Guide', 'Instructor', 'Front desk', 'Equipment'],
  events_entertainment: ['Performer', 'Crew', 'Usher', 'Bartender', 'Coat check'],
  health_fitness: ['Trainer', 'Instructor', 'Front desk', 'Massage therapist'],
};

/** Labels to seed for a given industry slug (falls back to DEFAULT). */
export function positionsForIndustry(slug: string | null | undefined): string[] {
  if (slug && POSITION_TEMPLATES[slug]) return POSITION_TEMPLATES[slug];
  return DEFAULT_POSITIONS;
}
