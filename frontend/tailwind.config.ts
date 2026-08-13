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
          DEFAULT: '#1e3a5f',
          light: '#2d5282'
        },
        accent: {
          DEFAULT: '#f59e0b',
          hover: '#d97706'
        },
        success: '#10b981',
        danger: '#ef4444',
        background: {
          dark: '#0f172a',
          light: '#f8fafc'
        },
        card: {
          dark: '#1e293b',
          light: '#ffffff'
        },
        text: {
          primary: {
            dark: '#f1f5f9',
            light: '#1e293b'
          },
          muted: '#94a3b8'
        }
      },
      fontFamily: {
        inter: ['var(--font-inter)'],
      }
    },
  },
  plugins: [],
}

export default config
