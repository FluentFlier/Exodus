import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core backgrounds
        paper: '#F7F3ED',
        surface: '#FFFFFF',
        panel: '#F1ECE5',

        // Text
        ink: '#1A1A18',
        inkMuted: '#6B6963',
        inkSubtle: '#9C9A94',

        // Borders
        border: '#E2DDD4',
        borderHover: '#D0CAC0',

        // Primary - Teal
        teal: {
          DEFAULT: '#0D7377',
          50: '#E8F5F5',
          100: '#D1EBEB',
          200: '#A3D7D8',
          300: '#75C3C5',
          400: '#47AFB2',
          500: '#0D7377',
          600: '#0B5F62',
          700: '#094B4D',
          800: '#073738',
          900: '#052324',
        },

        // Accent colors
        amber: {
          DEFAULT: '#D97706',
          50: '#FEF3C7',
          100: '#FDE68A',
          500: '#D97706',
          600: '#B45309',
        },
        sage: {
          DEFAULT: '#6B8E6B',
          50: '#F0F5F0',
          100: '#E1EBE1',
          500: '#6B8E6B',
        },
        coral: {
          DEFAULT: '#E07B67',
          50: '#FEF2F0',
          500: '#E07B67',
          600: '#D45D47',
        },
        violet: {
          DEFAULT: '#8B7EC8',
          50: '#F3F1FA',
          500: '#8B7EC8',
        },

        // Status
        success: '#059669',
        error: '#DC2626',
        warning: '#D97706',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.06), 0 8px 10px -6px rgb(0 0 0 / 0.06)',
        'glow': '0 0 20px rgb(13 115 119 / 0.15)',
        'glow-lg': '0 0 40px rgb(13 115 119 / 0.2)',
        'inner-soft': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.02)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-subtle': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'mesh-pattern': 'radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.03) 1px, transparent 0)',
      },
      backgroundSize: {
        'mesh': '24px 24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgb(13 115 119 / 0.1)' },
          '100%': { boxShadow: '0 0 30px rgb(13 115 119 / 0.2)' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
