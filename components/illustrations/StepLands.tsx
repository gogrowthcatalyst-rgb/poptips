/**
 * Step 03 — You get the tip. Every cent.
 *
 * A miniature pop-circle (the brand's hero motif) carrying a dollar sign.
 * Radiating lines suggest the moment of arrival. Jade palette — the
 * "depth of earning," the journey's destination.
 */
export function StepLands({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id="stepLandsHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2C6F57" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2C6F57" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft jade halo */}
      <circle cx="40" cy="40" r="34" fill="url(#stepLandsHalo)" />

      {/* Outer dashed ring */}
      <circle
        cx="40"
        cy="40"
        r="28"
        fill="none"
        stroke="#2C6F57"
        strokeOpacity="0.5"
        strokeWidth="1.2"
        strokeDasharray="2 4"
      />

      {/* Inner solid ring */}
      <circle
        cx="40"
        cy="40"
        r="18"
        fill="#FBF7F1"
        stroke="#2C6F57"
        strokeWidth="2.5"
      />

      {/* Radiating lines — 8 at compass points */}
      <g
        stroke="#2C6F57"
        strokeOpacity="0.7"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <line x1="40" y1="4" x2="40" y2="10" />
        <line x1="40" y1="70" x2="40" y2="76" />
        <line x1="4" y1="40" x2="10" y2="40" />
        <line x1="70" y1="40" x2="76" y2="40" />
        <line x1="14" y1="14" x2="18" y2="18" />
        <line x1="62" y1="62" x2="66" y2="66" />
        <line x1="66" y1="14" x2="62" y2="18" />
        <line x1="14" y1="66" x2="18" y2="62" />
      </g>

      {/* Dollar sign in the center — uses Fraunces-italic-ish via SVG path */}
      <text
        x="40"
        y="48"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="600"
        fontSize="22"
        fill="#0E1420"
      >
        $
      </text>
    </svg>
  );
}
