/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Mountains of Christmas"', 'cursive'],
      },
      colors: {
        santa: {
          red: '#D42426',
          darkRed: '#A41214',
          green: '#165B33',
          gold: '#F8B229',
          snow: '#F0F4F8'
        }
      }
    }
  },
  plugins: [],
}