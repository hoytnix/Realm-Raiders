/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.jsx",
    "./App.jsx",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          light: '#f4ebd9',
          DEFAULT: '#ebdcc1',
          medium: '#dfcba6',
          dark: '#bfa379',
          deep: '#8c6843',
        },
      },
      fontFamily: {
        serif: ['Cinzel', 'MedievalSharp', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
