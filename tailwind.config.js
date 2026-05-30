/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#070708',
          light: '#0e0e11',
        },
        charcoal: '#0e0e11',
        slate: '#16161a',
        cream: {
          DEFAULT: '#f4ebd9',
          dark: '#b8b1a5',
        },
        gold: {
          DEFAULT: '#c5a880',
          bright: '#d4af37',
          dark: '#7a664d',
        },
        burgundy: '#40151c',
        white: '#ffffff',
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
