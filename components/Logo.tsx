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

const ASPECT: Record<LogoVariant, number> = {
  h:           1176 / 420,
  'h-dark':    1176 / 420,
  'h-mono':    1176 / 420,
  'h-white':   1176 / 420,
  icon:        1,
  'icon-mono': 1,
  'icon-white':1,
};

const SRC: Record<LogoVariant, string> = {
  h:           '/logos/pop-tips-h.png',
  'h-dark':    '/logos/pop-tips-h-dark.png',
  'h-mono':    '/logos/pop-tips-h-mono.png',
  'h-white':   '/logos/pop-tips-h-white.png',
  icon:        '/logos/pop-tips-icon.png',
  'icon-mono': '/logos/pop-tips-icon-mono.png',
  'icon-white':'/logos/pop-tips-icon-white.png',
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
