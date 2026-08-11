import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ══════════════════════════════════════════════
        // HEIRLOOM PALETTE — Earth & Ritual
        // Every color has a story.
        // ══════════════════════════════════════════════

        // Kumkum — Sacred vermillion, marriage, shakti
        kumkum: {
          DEFAULT: '#8B2635',
          deep:    '#6B1E28',
          light:   '#B03244',
          50:      '#FDF5F6',
          100:     '#FAECEE',
          900:     '#4A1520',
          950:     '#1A0508',
        },

        // Haldi — Turmeric, auspicious beginnings, warmth
        haldi: {
          DEFAULT: '#D4A537',
          light:   '#E8C96B',
          deep:    '#AA8C2C',
          pale:    '#F5E8B8',
        },

        // Neem — Healing green, growth, longevity
        neem: {
          DEFAULT: '#2D5A3D',
          light:   '#3D7A53',
          deep:    '#1B3A2D',
          pale:    '#EBF4EE',
        },

        // Chandan — Sandalwood, calm, ritual purity
        chandan: {
          DEFAULT:  '#FDF8F3',
          deep:     '#F5ECE3',
          warm:     '#EDE0D0',
          whisper:  '#F9F5F0',
        },

        // Kajal — Kohl, intensity, clarity
        kajal: {
          DEFAULT: '#1A1614',
          soft:    '#4A423D',
          whisper: '#8B827A',
          faint:   '#C4BDB8',
        },

        // Rice — Purity, breath, negative space
        rice: '#FFFFFF',

        // Midnight — Night sky, depth, mystery
        midnight: {
          DEFAULT: '#0D0B0A',
          deep:    '#06050A',
        },

        // ══════════════════════════════════════════════
        // LEGACY ALIASES — backward compatibility
        // Old components using brand-*/accent-*/surface-*/ink-* still work.
        // New narrative components use the semantic names above.
        // ══════════════════════════════════════════════
        brand: {
          50:  '#FBF7F4',
          100: '#F5EDE6',
          200: '#E7D5C8',
          300: '#D3B5A2',
          400: '#BC8F7B',
          500: '#A36B56',
          600: '#894E3A',
          700: '#723A2D',
          800: '#8B2635', // → kumkum
          900: '#6B1E28', // → kumkum-deep
          950: '#1A0508',
        },
        accent: {
          DEFAULT: '#D4A537', // → haldi
          light:   '#E8C96B', // → haldi-light
          dark:    '#AA8C2C', // → haldi-deep
        },
        surface: {
          DEFAULT: '#FDF8F3', // → chandan
          muted:   '#F5ECE3', // → chandan-deep
          subtle:  '#EDE0D0', // → chandan-warm
        },
        ink: {
          DEFAULT: '#1A1614', // → kajal
          muted:   '#4A423D', // → kajal-soft
          faint:   '#8B827A', // → kajal-whisper
        },

        // Semantic states
        success:     '#2D5A3D', // → neem
        warning:     '#D4A537', // → haldi
        error:       '#8B2635', // → kumkum
        'dark-green': '#2D5A3D',

        // Silk-inspired surface tones (kept for backward compat)
        silk: {
          ivory:     '#FFFFF0',
          cream:     '#FFFDD0',
          champagne: '#F7E7CE',
          pearl:     '#F0EAD6',
        },
      },

      fontFamily: {
        // New heirloom type system
        'noto-serif': ['var(--font-noto-serif)', 'Noto Serif', 'Georgia', 'serif'],
        'literata':   ['var(--font-literata)', 'Literata', 'Georgia', 'serif'],
        'inter':      ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],

        // Legacy aliases (backward compat)
        sans:  ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-noto-serif)', 'Noto Serif', 'Georgia', 'serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        // Optical scale for display
        'display-xl': ['clamp(3rem, 6vw, 5rem)',  { lineHeight: '1.0', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.25rem, 4vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em'  }],
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        // Heirloom shadows — warm-tinted
        'kumkum-sm':  '0 2px 8px rgba(139, 38, 53, 0.08)',
        'kumkum-md':  '0 4px 16px rgba(139, 38, 53, 0.12)',
        'kumkum-lg':  '0 8px 32px rgba(139, 38, 53, 0.16)',
        'haldi':      '0 4px 20px rgba(212, 165, 55, 0.20)',
        'haldi-glow': '0 0 24px rgba(212, 165, 55, 0.35)',
        'paper':      '0 2px 12px rgba(26, 22, 20, 0.06), 0 1px 3px rgba(26, 22, 20, 0.04)',
        'paper-hover':'0 6px 24px rgba(26, 22, 20, 0.10), 0 2px 8px rgba(26, 22, 20, 0.06)',
        'story':      '0 8px 40px rgba(26, 22, 20, 0.12), 0 2px 8px rgba(26, 22, 20, 0.06)',
        'immersive':  '0 16px 64px rgba(26, 22, 20, 0.20), 0 4px 16px rgba(26, 22, 20, 0.08)',

        // Legacy aliases
        'brand-sm':   '0 2px 8px rgba(139, 38, 53, 0.06)',
        'brand-md':   '0 4px 16px rgba(139, 38, 53, 0.10)',
        'brand-lg':   '0 8px 32px rgba(139, 38, 53, 0.14)',
        'card':       '0 1px 4px rgba(26, 22, 20, 0.05), 0 4px 16px rgba(26, 22, 20, 0.03)',
        'card-hover': '0 4px 12px rgba(26, 22, 20, 0.08), 0 12px 32px rgba(26, 22, 20, 0.05)',
        'gold':       '0 4px 16px rgba(212, 165, 55, 0.18)',
        'luxury':     '0 8px 30px rgba(26, 22, 20, 0.08), 0 2px 8px rgba(26, 22, 20, 0.04)',
      },

      spacing: {
        // Sacred geometry rhythm — multiples of 8 with half-steps
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },

      animation: {
        // Preserved legacy animations
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-up':   'slideUp 0.4s ease-out forwards',
        'slide-right':'slideRight 0.35s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'scale-in':   'scaleIn 0.2s ease-out forwards',

        // New heirloom animations
        'breath':      'breathe 4s ease-in-out infinite',
        'haldi-pulse': 'haldiPulse 2s ease-in-out infinite',
        'waveform-1':  'wave1 1.2s ease-in-out infinite',
        'waveform-2':  'wave2 1.2s ease-in-out infinite 0.15s',
        'waveform-3':  'wave3 1.2s ease-in-out infinite 0.3s',
      },

      keyframes: {
        // Legacy
        fadeIn:     { from: { opacity: '0', transform: 'translateY(8px)' },  to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp:    { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight: { from: { opacity: '0', transform: 'translateX(-100%)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft:  { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        scaleIn:    { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        // New
        breathe:    { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.015)' } },
        haldiPulse: { '0%,100%': { boxShadow: '0 0 0 rgba(212,165,55,0)' }, '50%': { boxShadow: '0 0 24px rgba(212,165,55,0.35)' } },
        wave1: { '0%,100%': { transform: 'scaleY(0.4)' }, '50%': { transform: 'scaleY(1)' } },
        wave2: { '0%,100%': { transform: 'scaleY(0.7)' }, '50%': { transform: 'scaleY(0.3)' } },
        wave3: { '0%,100%': { transform: 'scaleY(0.5)' }, '50%': { transform: 'scaleY(0.9)' } },
      },

      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      backgroundImage: {
        // Woven texture — subtle SVG weave at 2% opacity
        'woven': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Crect width='1' height='6' fill='%231A1614' opacity='0.12'/%3E%3Crect y='0' width='6' height='1' fill='%231A1614' opacity='0.08'/%3E%3C/svg%3E")`,
        // Radial vignette for immersive hero
        'vignette': 'radial-gradient(ellipse at center, transparent 50%, rgba(13,11,10,0.6) 100%)',
        'vignette-bottom': 'linear-gradient(to top, rgba(13,11,10,0.85) 0%, rgba(13,11,10,0.3) 40%, transparent 70%)',
        // Haldi shimmer gradient
        'haldi-shimmer': 'linear-gradient(135deg, #D4A537 0%, #F5E8B8 50%, #D4A537 100%)',
        // Paper grain (CSS-only)
        'paper-grain': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
      },
    },
  },
  plugins: [],
};

export default config;
