/**
 * Recipient data access — reads for the public profile, writes for signup.
 *
 * Keeps Drizzle queries out of the page/route files so the call sites stay
 * readable and the query shapes live in one place.
 */

import { eq, asc } from 'drizzle-orm';
import QRCode from 'qrcode';
import { put } from '@vercel/blob';
import { db } from './index';
import {
  recipients,
  recipientPaymentApps,
  type Recipient,
  type RecipientPaymentApp,
  type PaymentApp,
} from './schema';

export interface RecipientWithApps extends Recipient {
  paymentApps: RecipientPaymentApp[];
}

/**
 * Fetch a recipient by handle, with their payment apps (ordered).
 * Returns null if no recipient exists for that handle.
 */
export async function getRecipientByHandle(
  handle: string,
): Promise<RecipientWithApps | null> {
  const rows = await db
    .select()
    .from(recipients)
    .where(eq(recipients.handle, handle.toLowerCase()))
    .limit(1);

  const recipient = rows[0];
  if (!recipient) return null;

  const apps = await db
    .select()
    .from(recipientPaymentApps)
    .where(eq(recipientPaymentApps.recipientId, recipient.id))
    .orderBy(asc(recipientPaymentApps.sortOrder));

  return { ...recipient, paymentApps: apps };
}

export interface CreateRecipientInput {
  handle: string;
  displayName: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  role?: string | null;
  message?: string | null;
  photoUrl?: string | null;
  workplaceName?: string | null;
  workplaceAddress?: string | null;
  workplacePhone?: string | null;
  ghlContactId?: string | null;
  termsAcceptedAt?: Date | null;
  apps: { app: PaymentApp; appHandle: string; isPrimary?: boolean }[];
}

/**
 * Generate a QR PNG for a recipient's public profile URL and store it in
 * Vercel Blob. Returns the public blob URL.
 *
 * The QR is deterministic (encodes https://pop.tips/{handle}); we own the
 * asset rather than depending on GHL. If BLOB_READ_WRITE_TOKEN is missing
 * (e.g. local dev without blob configured), returns null and the caller
 * proceeds without a stored QR — it can be regenerated later.
 */
export async function generateAndStoreQr(handle: string): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_APP_ORIGIN ?? 'https://pop.tips';
  const profileUrl = `${base.replace(/\/$/, '')}/${handle}`;

  const pngBuffer = await QRCode.toBuffer(profileUrl, {
    type: 'png',
    width: 1024,
    margin: 2,
    errorCorrectionLevel: 'M',
  });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }

  const blob = await put(`qrs/${handle}.png`, pngBuffer, {
    access: 'public',
    contentType: 'image/png',
    addRandomSuffix: false,
  });

  return blob.url;
}

/**
 * Create a recipient with their payment apps and a generated QR.
 * Returns the new recipient row (without apps re-joined).
 */
export async function createRecipient(
  input: CreateRecipientInput,
): Promise<Recipient> {
  const handle = input.handle.toLowerCase();

  // Generate QR first so we can store its URL on the row. If blob isn't
  // configured, qrUrl stays null and we can backfill later.
  let qrUrl: string | null = null;
  try {
    qrUrl = await generateAndStoreQr(handle);
  } catch {
    qrUrl = null; // non-fatal — recipient still created
  }

  const inserted = await db
    .insert(recipients)
    .values({
      handle,
      displayName: input.displayName,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      role: input.role ?? null,
      termsAcceptedAt: input.termsAcceptedAt ?? null,
      message: input.message ?? null,
      photoUrl: input.photoUrl ?? null,
      workplaceName: input.workplaceName ?? null,
      workplaceAddress: input.workplaceAddress ?? null,
      workplacePhone: input.workplacePhone ?? null,
      ghlContactId: input.ghlContactId ?? null,
      qrUrl,
    })
    .returning();

  const recipient = inserted[0];

  if (input.apps.length > 0) {
    await db.insert(recipientPaymentApps).values(
      input.apps.map((a, i) => ({
        recipientId: recipient.id,
        app: a.app,
        appHandle: a.appHandle,
        isPrimary: a.isPrimary ?? i === 0,
        sortOrder: i,
      })),
    );
  }

  return recipient;
}


export interface UpdateRecipientProfileInput {
  recipientId: string;
  role?: string | null;
  message?: string | null;
  photoUrl?: string | null;
  photoRequiredBy?: Date | null;
  apps: { app: PaymentApp; appHandle: string; isPrimary?: boolean }[];
}

/**
 * Complete / update a recipient's profile: replaces their payment apps and
 * updates role/message/photo. Used by the post-signup profile-completion step.
 * Replacing apps (delete-then-insert) keeps the set authoritative and simple.
 */
export async function updateRecipientProfile(
  input: UpdateRecipientProfileInput,
): Promise<void> {
  await db
    .update(recipients)
    .set({
      role: input.role ?? null,
      message: input.message ?? null,
      ...(input.photoUrl ? { photoUrl: input.photoUrl } : {}),
      photoRequiredBy: input.photoRequiredBy ?? null,
      updatedAt: new Date(),
    })
    .where(eq(recipients.id, input.recipientId));

  // Replace apps: clear existing, insert the new set.
  await db.delete(recipientPaymentApps).where(eq(recipientPaymentApps.recipientId, input.recipientId));

  if (input.apps.length > 0) {
    await db.insert(recipientPaymentApps).values(
      input.apps.map((a, i) => ({
        recipientId: input.recipientId,
        app: a.app,
        appHandle: a.appHandle,
        isPrimary: a.isPrimary ?? i === 0,
        sortOrder: i,
      })),
    );
  }
}

/** Fetch a recipient by id, with payment apps. */
export async function getRecipientById(id: string): Promise<RecipientWithApps | null> {
  const rows = await db.select().from(recipients).where(eq(recipients.id, id)).limit(1);
  const recipient = rows[0];
  if (!recipient) return null;
  const apps = await db
    .select()
    .from(recipientPaymentApps)
    .where(eq(recipientPaymentApps.recipientId, recipient.id))
    .orderBy(asc(recipientPaymentApps.sortOrder));
  return { ...recipient, paymentApps: apps };
}
