/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        tuf: {
          red: '#D32F2F',       // Striver's Red
          hover: '#B71C1C',
          black: '#121212',     // Main Background
          card: '#1E1E1E',      // Card Background
          text: '#E0E0E0',      // Primary Text
          muted: '#9E9E9E',     // Secondary Text
          border: '#333333'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}