/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'christmas-red': '#DC2626',
        'christmas-green': '#059669',
        'christmas-gold': '#F59E0B',
      },
    },
  },
  plugins: [],
}
