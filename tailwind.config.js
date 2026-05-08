/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // earthbound-y palette
        sky:    '#7ac1ff',
        grass:  '#4cc474',
        coin:   '#ffd84a',
        magenta:'#ff5dac',
        royal:  '#3a3aff',
        nightbg:'#0a0420',
        slate:  '#1a1830',
        cream:  '#f7eed1',
        pinky:  '#ffb6e0',
        deep:   '#1f0a3a',
        red:    '#ff3a4f',
        green:  '#7be67b',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono:  ['"Silkscreen"', 'monospace'],
        body:  ['"VT323"', 'monospace'],
      },
    },
  },
  plugins: [],
}
