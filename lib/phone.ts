/**
 * Phone normalization to E.164 (e.g. "+18315660384").
 *
 * GHL / carriers route reliably only on E.164. Users type all sorts of
 * formats — "(831) 566-0384", "831-566-0384", "8315660384" — so we normalize
 * at the boundary before storing or sending to GHL.
 *
 * US-focused (the launch market) with pass-through for already-international
 * numbers. Returns null when it can't confidently normalize.
 */

export function toE164(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const hadPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');

  if (!digits) return null;

  // Already international (user typed a +).
  if (hadPlus) {
    return digits.length >= 8 ? `+${digits}` : null;
  }

  // US 10-digit -> +1XXXXXXXXXX
  if (digits.length === 10) return `+1${digits}`;

  // US 11-digit starting with country code 1 -> +1XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;

  // Anything else we can't confidently place.
  return null;
}
