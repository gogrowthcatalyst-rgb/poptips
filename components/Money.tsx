import { cn } from '@/lib/cn';

interface MoneyProps {
  /** The amount in dollars, e.g. 20 or 0 or 148.50 */
  amount: number;
  /** Display size class — 'sm' for body lists, 'lg' for cards, 'xl' for the hero. Defaults to 'lg'. */
  size?: 'sm' | 'lg' | 'xl' | '2xl';
  /** Use accent color for the $ glyph. Default true. */
  accentSign?: boolean;
  /** Override the $ sign color directly (e.g. gold for the hero PopCircle).
   *  When set, takes precedence over accentSign. */
  signColor?: string;
  className?: string;
}

const SIZE: Record<NonNullable<MoneyProps['size']>, { number: string; sign: string }> = {
  sm:  { number: 'text-2xl',                                  sign: 'text-xs' },
  lg:  { number: 'text-4xl md:text-5xl',                      sign: 'text-sm md:text-base' },
  xl:  { number: 'text-6xl md:text-7xl lg:text-8xl',          sign: 'text-xl md:text-2xl' },
  '2xl':{ number: 'text-7xl md:text-8xl lg:text-9xl',         sign: 'text-2xl md:text-3xl' },
};

/**
 * Display amounts. For inline ($20 in a sentence), use:
 *   <span className="money font-medium text-ink">$20</span>
 * For hero-tier display, use this component.
 */
export function Money({
  amount,
  size = 'lg',
  accentSign = true,
  signColor,
  className,
}: MoneyProps) {
  const sz = SIZE[size];

  // Format: split int and decimal so we can render decimal smaller
  const isWhole = Number.isInteger(amount);
  const dollars = isWhole ? amount.toString() : Math.floor(amount).toString();
  const cents = isWhole ? null : (amount - Math.floor(amount)).toFixed(2).slice(2);

  // signColor takes precedence over accentSign when both set
  const signClass = signColor
    ? ''
    : accentSign
      ? 'text-accent'
      : 'text-ink-faint';
  const signStyle = signColor ? { color: signColor } : undefined;

  return (
    <span className={cn('inline-flex items-baseline', className)}>
      <span
        className={cn(
          'font-mono font-medium leading-none',
          sz.sign,
          signClass,
          'mr-0.5 self-start translate-y-[0.2em]', // superscript-ish vertical lift
        )}
        style={signStyle}
      >
        $
      </span>
      <span
        className={cn(
          'font-display italic font-medium leading-[0.95] tracking-tight text-ink',
          sz.number,
        )}
      >
        {dollars}
      </span>
      {cents !== null && (
        <span
          className={cn(
            'font-display italic font-medium leading-[0.95] tracking-tight text-ink-dim',
            sz.sign,
            'ml-0.5',
          )}
        >
          .{cents}
        </span>
      )}
    </span>
  );
}
