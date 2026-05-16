/**
 * Step 01 — They scan your code.
 *
 * Abstract 5x5 QR-like grid with three corner anchors (the recognizable
 * QR pattern). Radiating dashed lines from upper-right suggest the scan
 * beam catching the code. Coral palette — the "warmth of giving" start
 * of the journey.
 */
export function StepScan({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Radiating scan lines from upper-right */}
      <g stroke="#F06844" strokeOpacity="0.6" strokeWidth="1.2" strokeLinecap="round">
        <line x1="64" y1="6" x2="58" y2="12" />
        <line x1="72" y1="14" x2="64" y2="18" strokeDasharray="2 2" />
        <line x1="68" y1="22" x2="62" y2="22" strokeDasharray="1 2" />
        <line x1="74" y1="28" x2="66" y2="28" strokeDasharray="2 3" />
      </g>

      {/* Three corner anchors of the QR (top-left, top-right, bottom-left) */}
      <g fill="none" stroke="#0E1420" strokeWidth="2.5">
        <rect x="12" y="12" width="14" height="14" rx="1.5" />
        <rect x="42" y="12" width="14" height="14" rx="1.5" />
        <rect x="12" y="42" width="14" height="14" rx="1.5" />
      </g>

      {/* Inner blocks of the corner anchors */}
      <g fill="#F06844">
        <rect x="16" y="16" width="6" height="6" rx="0.5" />
        <rect x="46" y="16" width="6" height="6" rx="0.5" />
        <rect x="16" y="46" width="6" height="6" rx="0.5" />
      </g>

      {/* Data cells scattered through the QR area */}
      <g fill="#0E1420">
        <rect x="30" y="14" width="3" height="3" />
        <rect x="34" y="18" width="3" height="3" />
        <rect x="30" y="22" width="3" height="3" />
        <rect x="14" y="30" width="3" height="3" />
        <rect x="22" y="32" width="3" height="3" />
        <rect x="30" y="30" width="5" height="5" />
        <rect x="38" y="34" width="3" height="3" />
        <rect x="46" y="32" width="3" height="3" />
        <rect x="50" y="36" width="3" height="3" />
        <rect x="42" y="42" width="3" height="3" />
        <rect x="50" y="46" width="5" height="5" />
        <rect x="34" y="50" width="3" height="3" />
        <rect x="42" y="54" width="3" height="3" />
        <rect x="30" y="58" width="3" height="3" />
      </g>

      {/* Coral accent cells for warmth */}
      <g fill="#F06844" fillOpacity="0.8">
        <rect x="38" y="30" width="3" height="3" />
        <rect x="46" y="42" width="3" height="3" />
        <rect x="22" y="50" width="3" height="3" />
      </g>
    </svg>
  );
}
