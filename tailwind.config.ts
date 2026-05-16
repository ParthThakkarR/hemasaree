import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Maroon Palette
        brand: {
          50: '#FBF7F4',
          100: '#F5EDE6',
          200: '#E7D5C8',
          300: '#D3B5A2',
          400: '#BC8F7B',
          500: '#A36B56',
          600: '#894E3A',
          700: '#723A2D',
          800: '#5E2A35', // Primary Deep Maroon
          900: '#4A2028',
          950: '#1A0A0E',
        },
        accent: {
          DEFAULT: '#D4AF37', // Soft Gold
          light: '#E8C96B',
          dark: '#AA8C2C',
        },
        // Neutral / Surface — Warm Ivory & Cream
        surface: {
          DEFAULT: '#FFFDF7',
          muted: '#F8F3EA',
          subtle: '#EDE6D6',
        },
        // Text
        ink: {
          DEFAULT: '#2A1F1F',
          muted: '#5C4E4E',
          faint: '#A09090',
        },
        // Semantic
        success: '#1B3A2D', // Deep Forest Green
        warning: '#C78D20',
        error: '#8B2525',
        'dark-green': '#1B3A2D',
        // Silk-inspired tones
        silk: {
          ivory: '#FFFFF0',
          cream: '#FFFDD0',
          champagne: '#F7E7CE',
          pearl: '#F0EAD6',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'brand-sm': '0 2px 8px rgba(94, 42, 53, 0.06)',
        'brand-md': '0 4px 16px rgba(94, 42, 53, 0.10)',
        'brand-lg': '0 8px 32px rgba(94, 42, 53, 0.14)',
        'card':     '0 1px 4px rgba(42, 31, 31, 0.05), 0 4px 16px rgba(42, 31, 31, 0.03)',
        'card-hover': '0 4px 12px rgba(42, 31, 31, 0.08), 0 12px 32px rgba(42, 31, 31, 0.05)',
        'gold': '0 4px 16px rgba(212, 175, 55, 0.15)',
        'luxury': '0 8px 30px rgba(42, 31, 31, 0.08), 0 2px 8px rgba(42, 31, 31, 0.04)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-up':   'slideUp 0.4s ease-out forwards',
        'slide-right':'slideRight 0.35s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'scale-in':   'scaleIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight:{ from: { opacity: '0', transform: 'translateX(-100%)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
