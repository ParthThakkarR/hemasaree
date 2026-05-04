import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Rani Red Palette
        brand: {
          50:  '#fdf6f7',
          100: '#f9ecee',
          200: '#f1d6db',
          300: '#e6b5be',
          400: '#d58a9a',
          500: '#bf596d',
          600: '#a33b50',
          700: '#88293d',
          800: '#6b0f1a', // Primary Rani Red
          900: '#5a0c16',
          950: '#3d1a24',
        },
        accent: {
          DEFAULT: '#c9a84c', // Heritage Gold
          light: '#dfc67a',
          dark: '#a68731',
        },
        // Neutral / Surface
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#fbf5ec', // Warm Ivory
          subtle:  '#f3ece1',
        },
        // Text
        ink: {
          DEFAULT: '#1c1917',
          muted:   '#57534e',
          faint:   '#a8a29e',
        },
        // Semantic
        success: '#16a34a',
        warning: '#d97706',
        error:   '#dc2626',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'brand-sm': '0 2px 8px rgba(236, 72, 153, 0.08)',
        'brand-md': '0 4px 16px rgba(236, 72, 153, 0.12)',
        'brand-lg': '0 8px 32px rgba(236, 72, 153, 0.16)',
        'card':     '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-up':   'slideUp 0.4s ease-out forwards',
        'slide-right':'slideRight 0.35s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight:{ from: { opacity: '0', transform: 'translateX(100%)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
