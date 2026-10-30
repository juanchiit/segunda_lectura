/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2ff',
          100: '#dde5ff',
          200: '#c3cfff',
          300: '#99abff',
          400: '#6b7fff',
          500: '#4050ff',
          600: '#1a1f8f',
          700: '#15196e',
          800: '#0f1357',
          900: '#0a0e3f',
          950: '#060929',
        },
        cream: {
          50: '#FFFDF5',
          100: '#FFF9E6',
          200: '#FFF3CC',
          300: '#FFEDB3',
          400: '#FFE799',
          500: '#F5E6C8',
        },
        brand: {
          blue: '#1B2A80',
          cream: '#FDFAEF',
          'cream-dark': '#F5EDD6',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
    },
  },
  plugins: [],
}
