/**
 * Step 02 — They open the app they already have.
 *
 * Phone outline with three app icons in a row. The middle one glows with
 * a halo (the "tap to open" moment). Gold palette — the celebration tier,
 * marking the pivotal connection point in the journey.
 */
export function StepHandoff({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Soft glow behind the highlighted center app */}
      <circle cx="40" cy="38" r="14" fill="#E9A21C" fillOpacity="0.18" />

      {/* Phone outline */}
      <rect
        x="22"
        y="10"
        width="36"
        height="60"
        rx="6"
        fill="none"
        stroke="#0E1420"
        strokeWidth="2.5"
      />

      {/* Screen area */}
      <rect
        x="26"
        y="16"
        width="28"
        height="44"
        rx="2"
        fill="#FBF7F1"
        stroke="#0E1420"
        strokeWidth="1"
      />

      {/* Notch indicator at top of phone */}
      <line x1="36" y1="12" x2="44" y2="12" stroke="#0E1420" strokeWidth="1.5" strokeLinecap="round" />

      {/* App icons row 1 */}
      <rect x="29" y="20" width="6" height="6" rx="1.5" fill="#0E1420" fillOpacity="0.15" />
      <rect x="37" y="20" width="6" height="6" rx="1.5" fill="#0E1420" fillOpacity="0.15" />
      <rect x="45" y="20" width="6" height="6" rx="1.5" fill="#0E1420" fillOpacity="0.15" />

      {/* App icons row 2 — middle one is the active wallet (gold) */}
      <rect x="29" y="28" width="6" height="6" rx="1.5" fill="#0E1420" fillOpacity="0.15" />
      <rect x="37" y="28" width="6" height="6" rx="1.5" fill="#E9A21C" />
      <rect x="45" y="28" width="6" height="6" rx="1.5" fill="#0E1420" fillOpacity="0.15" />

      {/* App icons row 3 */}
      <rect x="29" y="36" width="6" height="6" rx="1.5" fill="#0E1420" fillOpacity="0.15" />
      <rect x="37" y="36" width="6" height="6" rx="1.5" fill="#0E1420" fillOpacity="0.15" />
      <rect x="45" y="36" width="6" height="6" rx="1.5" fill="#0E1420" fillOpacity="0.15" />

      {/* Amount preview line at bottom of screen */}
      <line x1="29" y1="48" x2="51" y2="48" stroke="#0E1420" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" />

      {/* Send button glyph */}
      <rect x="32" y="52" width="16" height="5" rx="2.5" fill="#0E1420" />

      {/* Tap indicator — small dashed ring around the active app */}
      <circle
        cx="40"
        cy="31"
        r="6.5"
        fill="none"
        stroke="#E9A21C"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
    </svg>
  );
}
