import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class lists with clsx semantics + tailwind-merge dedupe.
 * Use everywhere: `cn('p-4', condition && 'bg-accent', extraClass)`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
