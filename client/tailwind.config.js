/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")], // <-- This is the missing line!
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F6F4F1',
          ink: '#121212',
          accent: '#FF5A1F',
          soft: '#FFF1EB',
          muted: '#6B7280',
          border: '#EFECE8',
        },
      },
    },
  },
  plugins: [],
}