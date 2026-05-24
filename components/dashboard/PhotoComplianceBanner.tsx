'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { processImageForUpload } from '@/lib/image-processing';

type Status = 'incomplete' | 'photo_required' | 'live';

interface Me {
  role: string | null;
  status?: Status;
  hasPhoto?: boolean;
  hoursLeft?: number | null;
}

/**
 * Self-fetching photo-compliance banner. Renders nothing for compliant
 * recipients (and for tippers). Shows an in-window nudge or a paused state,
 * each with an inline upload that makes them compliant immediately.
 *
 * NOTE: copy here is placeholder — FOMO pitch language to be dialed in later.
 */
export function PhotoComplianceBanner() {
  const [me, setMe] = useState<Me | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch('/api/me/photo-status');
      const data = (await res.json()) as Me;
      setMe(data);
    } catch {
      setMe(null);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const upload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const processed = await processImageForUpload(file);
      const form = new FormData();
      form.append('file', processed);
      const res = await fetch('/api/upload/photo', { method: 'POST', body: form });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? 'Upload failed. Try a different image.');
      } else {
        await load(); // refetch — banner should now disappear (compliant)
      }
    } catch {
      setError('Upload failed. Check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  // Render nothing for tippers, unknown, or compliant recipients (have a photo).
  if (!me || me.role !== 'recipient' || me.hasPhoto) return null;
  if (me.status === 'incomplete') return null; // handled by onboarding flow

  const expired = me.status === 'photo_required';
  const hours = me.hoursLeft ?? 0;

  return (
    <div
      className={cn(
        'mb-6 rounded-2xl border-2 p-5 md:p-6',
        expired ? 'border-[#B23A2E] bg-[#B23A2E]/5' : 'border-accent bg-accent-glow/15',
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-medium text-ink md:text-xl">
            {expired ? 'Your page is paused.' : "You're live — add your photo."}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-dim">
            {expired ? (
              <>Add a photo to switch tips back on. People tip who they recognize.</>
            ) : (
              <>
                A photo is how people know it&rsquo;s really you.{' '}
                <span className="font-medium text-ink">
                  {hours > 0 ? `${hours}h left` : 'Add it now'}
                </span>{' '}
                before your page pauses.
              </>
            )}
          </p>
          {error && <p className="mt-2 text-xs text-[#B23A2E]">{error}</p>}
        </div>

        <label className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent px-6 py-3 font-display text-base font-medium text-paper shadow-lift transition-all hover:-translate-y-px hover:bg-accent-dim active:scale-95">
          {uploading ? 'Uploading…' : 'Add my photo'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
        </label>
      </div>
    </div>
  );
}
