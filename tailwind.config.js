/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-newsreader)', 'serif'], // override font-sans con Newsreader
        newsreader: ['var(--font-newsreader)', 'serif'],
      },
    },
  },
  plugins: [],
};
