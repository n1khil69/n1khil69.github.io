/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#0b1a13',
          light: '#162d22',
        },
        cream: {
          DEFAULT: '#faf7f2',
          dark: '#eadecd',
        },
        gold: {
          DEFAULT: '#c5a880',
          bright: '#d4af37',
          dark: '#8c7352',
        },
        blush: '#e8c5c8',
        burgundy: '#5b1d28',
        slate: '#1c2421',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Outfit"', 'sans-serif'],
        cursive: ['"Pinyon Script"', 'cursive'],
      },
    },
  },
  plugins: [],
}
