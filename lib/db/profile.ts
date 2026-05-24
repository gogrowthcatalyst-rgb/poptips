/**
 * Profile edit data-access — partial, non-destructive updates for the
 * self-serve "edit your details" surface.
 *
 * Why not reuse updateRecipientProfile? That function is an ONBOARDING-
 * completion writer: it nulls role/message when they're omitted and REPLACES
 * the whole payment-app set. Calling it for a partial edit (say, just the
 * message) would silently wipe the role and every payment handle. These
 * writers only touch the keys you actually pass — nothing else moves.
 *
 * Out of scope here (handled in the handle-change chunk, behind SMS step-up):
 * the public handle and the payment-app handles. This module deliberately
 * cannot change either.
 *
 * Power of Ten: small writers, explicit field whitelists, a guard against
 * empty updates, one level of logic, every value checked at the boundary by
 * the caller (the API route) before it reaches here.
 */

import { eq } from 'drizzle-orm';
import { db } from './index';
import { recipients, tippers, type Recipient, type Tipper, type PaymentApp } from './schema';

/* ───────────────────────────── reads ────────────────────────────── */

export async function getRecipientById(id: string): Promise<Recipient | null> {
  const rows = await db.select().from(recipients).where(eq(recipients.id, id)).limit(1);
  return rows[0] ?? null;
}

/**
 * NOTE (integration): the staged billing slice also defines getTipperById.
 * When that slice merges, keep ONE definition — import it from here rather
 * than redeclaring, so there's a single source of truth for tipper reads.
 */
export async function getTipperById(id: string): Promise<Tipper | null> {
  const rows = await db.select().from(tippers).where(eq(tippers.id, id)).limit(1);
  return rows[0] ?? null;
}

/* ──────────────────────────── writers ───────────────────────────── */

export interface RecipientEditableFields {
  firstName?: string;
  lastName?: string;
  message?: string | null;
  role?: string | null;
  primaryIndustry?: string;
  industryOther?: string | null;
  homeZip?: string;
  birthYear?: number | null;
  workplaceName?: string;
  workplaceAddress?: string | null;
  workplacePhone?: string | null;
}

/** Update only the recipient fields actually supplied. Never touches apps/handle/photo. */
export async function updateRecipientEditable(
  id: string,
  fields: RecipientEditableFields,
): Promise<void> {
  const set: Record<string, unknown> = { updatedAt: new Date() };

  if (fields.firstName !== undefined) set.firstName = fields.firstName;
  if (fields.lastName !== undefined) set.lastName = fields.lastName;
  // Keep the denormalized displayName in sync when both name parts are sent.
  if (fields.firstName !== undefined && fields.lastName !== undefined) {
    set.displayName = `${fields.firstName} ${fields.lastName}`.trim();
  }
  if (fields.message !== undefined) set.message = fields.message;
  if (fields.role !== undefined) set.role = fields.role;
  if (fields.primaryIndustry !== undefined) set.primaryIndustry = fields.primaryIndustry;
  if (fields.industryOther !== undefined) set.industryOther = fields.industryOther;
  if (fields.homeZip !== undefined) set.homeZip = fields.homeZip;
  if (fields.birthYear !== undefined) set.birthYear = fields.birthYear;
  if (fields.workplaceName !== undefined) set.workplaceName = fields.workplaceName;
  if (fields.workplaceAddress !== undefined) set.workplaceAddress = fields.workplaceAddress;
  if (fields.workplacePhone !== undefined) set.workplacePhone = fields.workplacePhone;

  // Guard: refuse a no-op write (only updatedAt present) — a sign of a bug
  // upstream rather than a real edit.
  if (Object.keys(set).length <= 1) {
    throw new Error('updateRecipientEditable: nothing to update');
  }

  await db.update(recipients).set(set).where(eq(recipients.id, id));
}

export interface TipperEditableFields {
  firstName?: string;
  lastName?: string;
  primaryIndustry?: string;
  industryOther?: string | null;
  homeZip?: string;
  birthYear?: number | null;
  usesApps?: PaymentApp[];
}

/** Update only the tipper fields actually supplied. */
export async function updateTipperEditable(
  id: string,
  fields: TipperEditableFields,
): Promise<void> {
  const set: Record<string, unknown> = { updatedAt: new Date() };

  if (fields.firstName !== undefined) set.firstName = fields.firstName;
  if (fields.lastName !== undefined) set.lastName = fields.lastName;
  if (fields.primaryIndustry !== undefined) set.primaryIndustry = fields.primaryIndustry;
  if (fields.industryOther !== undefined) set.industryOther = fields.industryOther;
  if (fields.homeZip !== undefined) set.homeZip = fields.homeZip;
  if (fields.birthYear !== undefined) set.birthYear = fields.birthYear;
  if (fields.usesApps !== undefined) set.usesApps = fields.usesApps;

  if (Object.keys(set).length <= 1) {
    throw new Error('updateTipperEditable: nothing to update');
  }

  await db.update(tippers).set(set).where(eq(tippers.id, id));
}
