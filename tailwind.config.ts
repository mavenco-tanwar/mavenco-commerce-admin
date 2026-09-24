import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDF8F7',
          100: '#FBF0EE',
          200: '#F5DDD8',
          300: '#E8B8B5', // Blush Pink
          400: '#CF9584', // Dusty Rose
          500: '#B77A68', // Rose Gold
          600: '#9C5E4D',
          700: '#7E4638',
          800: '#603328',
          900: '#422018',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
