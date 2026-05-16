/**
 * Handles that can NEVER be claimed as profile URLs.
 *
 * Two forces converge here:
 *   1. File-system routes already win over /[handle] in Next.js.
 *      Names like "dashboard", "signup-tipper" are auto-reserved.
 *   2. We also reserve names we DON'T have routes for yet, so they're
 *      available for future use (admin, api, settings, etc.) without
 *      breaking anyone's printed QR code.
 *
 * The signup form (Session 3) imports this same list. One source of truth.
 */
export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  // Routes that already exist
  'dashboard',
  'signup-tipper',
  'signup-recipient',

  // Reserved for app system
  'admin',
  'api',
  'app',
  'auth',
  'login',
  'logout',
  'signin',
  'signout',
  'signup',
  'register',
  'settings',
  'profile',
  'account',
  'tip', // legacy /tip/* route, blocked to prevent confusion
  'send',

  // Reserved for content / marketing
  'about',
  'help',
  'support',
  'contact',
  'pricing',
  'privacy',
  'terms',
  'legal',
  'press',
  'blog',
  'docs',
  'wiki',
  'faq',
  'welcome',

  // Payment-method explainer pages
  'venmo',
  'cashapp',
  'paypal',
  'zelle',

  // Reserved for the brand itself
  'pop',
  'poptips',
  'pop-tips',
  'official',
  'team',
  'staff',

  // Reserved for safety / abuse-prevention
  'root',
  'system',
  'null',
  'undefined',
  'anonymous',
  'unknown',
  'test',
  'demo',
]);

export function isReservedHandle(handle: string): boolean {
  return RESERVED_HANDLES.has(handle.toLowerCase());
}

/**
 * Validate handle shape, separately from reservation.
 * Allows: lowercase letters, digits, hyphens. 2-30 chars. Must start with a letter.
 *
 * Disallows leading/trailing hyphens and double hyphens.
 */
const HANDLE_REGEX = /^[a-z](?:[a-z0-9]|-(?!-))*[a-z0-9]$/;

export function isValidHandleShape(handle: string): boolean {
  if (handle.length < 2 || handle.length > 30) return false;
  return HANDLE_REGEX.test(handle);
}

/**
 * Combined check for the signup flow.
 * Returns null if the handle is acceptable; a reason string otherwise.
 */
export function checkHandle(handle: string): string | null {
  if (!isValidHandleShape(handle)) {
    return 'Handles use lowercase letters, numbers, and hyphens. 2–30 characters.';
  }
  if (isReservedHandle(handle)) {
    return 'That one is reserved for Pop Tips itself.';
  }
  return null;
}
