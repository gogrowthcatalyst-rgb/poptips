'use client';

interface QrCardProps {
  handle: string;
  scannedThisWeek: number;
}

/**
 * The QR code card — visual centerpiece of the dashboard.
 *
 * Real QR generation is Session 8 (sounds + share kit + final polish).
 * For now we render a styled placeholder with the three corner anchors
 * that make a QR code recognizable, plus a jade "$" in the center where
 * the brand mark will sit on the final generated codes.
 *
 * The card carries the brand's "loud on purpose" jade halo so the QR
 * feels like a featured surface even when there's no scanned activity yet.
 */
export function QrCard({ handle, scannedThisWeek }: QrCardProps) {
  return (
    <div className="relative h-full overflow-hidden rounded-3xl border border-jade-100 bg-gradient-to-br from-jade-50 via-paper to-paper p-7 shadow-lift md:p-8">
      {/* Decorative orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-jade-100 opacity-55 blur-3xl"
      />

      {/* Header */}
      <div className="relative mb-3 flex items-start justify-between gap-3">
        <p className="font-mono text-xs font-medium uppercase tracking-wider2 text-jade-700">
          Your tip code
        </p>
        <p className="text-right font-mono text-xs text-ink-dim">
          pop.tips/{handle}
        </p>
      </div>
      <h2 className="relative font-display text-2xl font-medium leading-snug text-ink md:text-3xl">
        Where appreciation <em className="italic text-jade-500">lands.</em>
      </h2>

      {/* QR placeholder */}
      <div
        className="relative mx-auto my-7 aspect-square w-full max-w-[240px] overflow-hidden rounded-2xl border border-jade-100 bg-paper p-4"
        style={{ boxShadow: '0 0 0 8px rgba(44, 111, 87, 0.06), 0 0 32px rgba(44, 111, 87, 0.12)' }}
      >
        {/* Soft fill texture suggesting QR data — not a real QR */}
        <div
          aria-hidden
          className="absolute inset-4 rounded-lg opacity-[0.08]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, #0E1420 0 7%, transparent 7% 14%, #0E1420 14% 21%, transparent 21% 28%),
              repeating-linear-gradient(90deg, #0E1420 0 7%, transparent 7% 14%, #0E1420 14% 21%, transparent 21% 28%)
            `,
            backgroundBlendMode: 'multiply',
          }}
        />

        {/* Three QR corner anchors */}
        <div className="absolute left-4 top-4 h-9 w-9 rounded-md border-[6px] border-ink" />
        <div className="absolute right-4 top-4 h-9 w-9 rounded-md border-[6px] border-ink" />
        <div className="absolute bottom-4 left-4 h-9 w-9 rounded-md border-[6px] border-ink" />

        {/* Center mark — jade circle with $ */}
        <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-jade-500 font-display text-2xl font-semibold italic text-paper shadow-lift">
          $
        </div>
      </div>

      {/* Action buttons */}
      <div className="relative flex flex-wrap gap-2">
        <button
          type="button"
          className="flex-1 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper shadow-lift transition-all duration-200 ease-out-soft hover:-translate-y-px hover:bg-jade-700 hover:shadow-halo-jade active:scale-95"
        >
          Download PNG
        </button>
        <button
          type="button"
          className="flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-all duration-200 ease-out-soft hover:-translate-y-px hover:border-jade-300 hover:bg-jade-50"
        >
          Order stickers
        </button>
        <button
          type="button"
          className="flex-1 rounded-full border border-line bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-all duration-200 ease-out-soft hover:-translate-y-px hover:border-jade-300 hover:bg-jade-50"
        >
          Share link
        </button>
      </div>

      {/* Scan stat footer */}
      <div className="relative mt-5 border-t border-dashed border-line pt-4">
        <p className="font-mono text-[11px] uppercase tracking-wider2 text-ink-faint">
          {scannedThisWeek > 0 ? (
            <>
              Scanned <strong className="font-semibold text-ink">{scannedThisWeek} times</strong> this
              week
            </>
          ) : (
            <>Scan count appears once your QR is live.</>
          )}
        </p>
      </div>
    </div>
  );
}
