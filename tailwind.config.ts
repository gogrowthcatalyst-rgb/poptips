import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Skin-driven tokens. Every utility resolves through CSS vars,
        // so changing skins (tracks) changes every color in lockstep.
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--line)',
        'line-soft': 'var(--line-soft)',
        ink: {
          DEFAULT: 'var(--ink)',
          dim: 'var(--ink-dim)',
          faint: 'var(--ink-faint)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          dim: 'var(--accent-dim)',
          glow: 'var(--accent-glow)',
        },
        signal: 'var(--signal)',
        // Persistent track colors for the home audience portraits — they
        // appear together regardless of the current track, so they need
        // direct access (not via the swappable accent vars).
        coral: {
          50:  '#FFF1EC',
          100: '#FFDDD0',
          300: '#FFA587',
          500: '#F06844',
          700: '#C44A2C',
          900: '#6F2916',
        },
        jade: {
          50:  '#E8F1ED',
          100: '#C5DBCF',
          300: '#6BA589',
          500: '#2C6F57',
          700: '#1B4F3C',
          900: '#0C2A20',
        },
        gold: {
          100: '#FFEBC2',
          500: '#E9A21C',
          700: '#A76F00',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        wider2: '0.18em',
      },
      // === MOTION LANGUAGE ===
      // Style-guide promise: quiet by default, loud on purpose.
      transitionTimingFunction: {
        'ease-out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.25, 1.6, 0.5, 1)',
      },
      keyframes: {
        // Section reveal — fade up on scroll
        'reveal-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Spring scale-in — for the pop-circle hero, success states
        'pop-in': {
          '0%':   { opacity: '0', transform: 'scale(0.85)' },
          '60%':  { opacity: '1', transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Halo pulse — for the QR slot and active surfaces
        'halo-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.7', transform: 'scale(1.06)' },
        },
        // Confetti — used by the celebration block
        'confetti-burst': {
          '0%':   { opacity: '0', transform: 'translate(0,0) rotate(0deg)' },
          '10%':  { opacity: '1' },
          '100%': { opacity: '0', transform: 'translate(var(--cx), var(--cy)) rotate(var(--cr))' },
        },
        // Caret blink — for the typewriter handle preview
        'caret-blink': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        // Gentle drift — for decorative SVG elements
        'drift-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'reveal-up':      'reveal-up 600ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'pop-in':         'pop-in 520ms cubic-bezier(0.25, 1.6, 0.5, 1) both',
        'halo-pulse':     'halo-pulse 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'caret-blink':    'caret-blink 1s steps(2, end) infinite',
        'drift-slow':     'drift-slow 6s ease-in-out infinite',
      },
      boxShadow: {
        // Warm shadows, not cold black — preserves the cream-paper feel
        'lift': '0 4px 12px rgba(14, 20, 32, 0.06), 0 2px 4px rgba(14, 20, 32, 0.04)',
        'lift-strong': '0 12px 32px rgba(14, 20, 32, 0.10), 0 4px 8px rgba(14, 20, 32, 0.06)',
        // Coral / jade glow halos for celebration moments
        'halo-coral': '0 0 0 8px rgba(240, 104, 68, 0.10), 0 0 32px rgba(240, 104, 68, 0.20)',
        'halo-jade':  '0 0 0 8px rgba(44, 111, 87, 0.10), 0 0 32px rgba(44, 111, 87, 0.20)',
        'halo-gold':  '0 0 0 8px rgba(233, 162, 28, 0.14), 0 0 32px rgba(233, 162, 28, 0.30)',
      },
    },
  },
  plugins: [],
};

export default config;
