import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Muted Maroon Palette
        brand: {
          50: '#fbf7f8',
          100: '#f5eaec',
          200: '#e7ced3',
          300: '#d3aab2',
          400: '#bc808b',
          500: '#a35766',
          600: '#89404f',
          700: '#72323f',
          800: '#5e2a35', // Primary Muted Maroon
          900: '#50262f',
          950: '#2b1117',
        },
        accent: {
          DEFAULT: '#d4af37', // Soft Gold
          light: '#e8c96b',
          dark: '#aa8c2c',
        },
        // Neutral / Surface
        surface: {
          DEFAULT: '#fffdfa', // Cream/Ivory
          muted: '#f5f0e6', // Warm Beige
          subtle: '#ebe3d5',
        },
        // Text
        ink: {
          DEFAULT: '#2c2525',
          muted: '#5e5151',
          faint: '#a49898',
        },
        // Semantic
        success: '#2e5a3c', // Deep Green
        warning: '#d97706',
        error: '#9b2c2c',
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
