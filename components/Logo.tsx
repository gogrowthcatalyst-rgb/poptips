import Image from 'next/image';

export type LogoVariant =
  | 'h'           // horizontal color (default, for light surfaces)
  | 'h-dark'      // horizontal dark (alternate, for light surfaces)
  | 'h-mono'      // horizontal black mono
  | 'h-white'     // horizontal white mono (for dark surfaces)
  | 'icon'        // square icon color
  | 'icon-mono'   // square icon black mono
  | 'icon-white'; // square icon white mono (for dark surfaces)

interface LogoProps {
  variant?: LogoVariant;
  height: number; // pixel height; width auto-derived from aspect
  className?: string;
  priority?: boolean; // pass true for hero / above-the-fold uses
  alt?: string;
}

/**
 * Per-variant aspect ratio — different files have different intrinsic
 * dimensions. Pete's new files (h, h-dark, h-white, icon, icon-white) are
 * 1000×260 horizontal / 1000×1000 square. Legacy mono files still use the
 * old 1176×420 horizontal / 1:1 square dimensions until they're refreshed.
 */
const ASPECT: Record<LogoVariant, number> = {
  h:           1000 / 260,
  'h-dark':    1000 / 260,
  'h-mono':    1176 / 420,
  'h-white':   1000 / 260,
  icon:        1,
  'icon-mono': 1,
  'icon-white':1,
};

/**
 * File mapping. Pete's new files use the `pop-tips-logo-*` naming pattern;
 * legacy files use `pop-tips-*`. Both pattern coexist in /public/logos/.
 */
const SRC: Record<LogoVariant, string> = {
  h:           '/logos/pop-tips-logo-h.png',
  'h-dark':    '/logos/pop-tips-logo-h.png',
  'h-mono':    '/logos/pop-tips-h-mono.png',
  'h-white':   '/logos/pop-tips-logo-h-dark.png',
  icon:        '/logos/pop-tips-logo.png',
  'icon-mono': '/logos/pop-tips-icon-mono.png',
  'icon-white':'/logos/pop-tips-logo-dark.png',
};

export function Logo({
  variant = 'h',
  height,
  className = '',
  priority = false,
  alt = 'Pop Tips',
}: LogoProps) {
  const width = Math.round(height * ASPECT[variant]);
  return (
    <Image
      src={SRC[variant]}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
