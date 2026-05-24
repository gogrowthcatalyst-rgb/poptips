/**
 * Recipient tippable-status — the single rule for whether a recipient can
 * receive tips right now.
 *
 *  - 'incomplete'     : no payment apps yet (still setting up)
 *  - 'photo_required' : has apps, but the 48h photo window expired with no
 *                       photo -> UN-TIPPABLE until they add one (fail closed)
 *  - 'live'           : tippable
 *
 * A photo makes a recipient permanently compliant. The window only applies to
 * recipients who went live without one. Recipients with no deadline set (e.g.
 * pre-feature / seed accounts) are grandfathered as live.
 */

export const PHOTO_WINDOW_HOURS = 48;

export type TippableStatus = 'incomplete' | 'photo_required' | 'live';

interface StatusInput {
  paymentAppCount: number;
  photoUrl?: string | null;
  photoRequiredBy?: Date | null;
}

export function computeTippableStatus(input: StatusInput): TippableStatus {
  if (input.paymentAppCount === 0) return 'incomplete';
  if (input.photoUrl) return 'live';
  if (!input.photoRequiredBy) return 'live'; // grandfathered — no deadline set
  return input.photoRequiredBy.getTime() > Date.now() ? 'live' : 'photo_required';
}

/** Hours left in the photo window (>= 0), or null if not applicable. */
export function photoHoursLeft(photoRequiredBy?: Date | null): number | null {
  if (!photoRequiredBy) return null;
  const ms = photoRequiredBy.getTime() - Date.now();
  return ms <= 0 ? 0 : Math.ceil(ms / (1000 * 60 * 60));
}
