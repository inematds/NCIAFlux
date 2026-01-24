import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#5B4FCF',
          light: '#7B6FE7',
          dark: '#4A3FB8',
          contrast: '#FFFFFF',
        },
        secondary: {
          main: '#FFC107',
          light: '#FFD54F',
          dark: '#FFA000',
        },
        accent: {
          success: '#4CAF50',
          error: '#F44336',
          warning: '#FF9800',
          info: '#2196F3',
        },
        neutral: {
          background: '#F5F5F7',
          white: '#FFFFFF',
          textPrimary: '#1A1A2E',
          textSecondary: '#4A4A5A',
          textMuted: '#9A9AAA',
          border: '#E0E0E5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
