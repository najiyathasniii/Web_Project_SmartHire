const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // A cooler, charcoal-like dark background
        gray: colors.zinc, 
        
        // Swaps blue for a muted, sandy gold
        blue: colors.amber, 
        
        // Desaturates the bright greens into a subtle sage
        emerald: colors.teal, 
      }
    },
  },
  plugins: [],
}