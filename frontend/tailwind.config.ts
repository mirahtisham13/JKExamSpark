import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0ea5e9', // Sky 500 for a more electric modern feel
          light: '#38bdf8',
          dark: '#0284c7',
        },
        accent: {
          DEFAULT: '#8b5cf6', // Violet for a rich accent
          hover: '#7c3aed',
        },
        success: '#10b981',
        danger: '#ef4444',
        background: {
          dark: '#020617', // Very deep slate, almost black, for premium dark mode
          light: '#f8fafc'
        },
        card: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        text: {
          primary: {
            dark: '#f8fafc',
            light: '#0f172a'
          },
          muted: {
            dark: '#94a3b8',
            light: '#64748b'
          }
        }
      },
      fontFamily: {
        inter: ['var(--font-inter)'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

export default config
