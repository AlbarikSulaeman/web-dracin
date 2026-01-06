/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'wood-dark': '#3e2723',
        'wood-medium': '#8b4513',
        'wood-light': '#d2b48c',
        'wood-secondary': '#a0522d',
      },
    },
  },
  plugins: [],
}