const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Graphite base: cooler, charcoal-like dark backgrounds
        gray: colors.zinc, 
        
        // The Muted Gold: swaps out the tech-blue for a sandy, expensive amber
        blue: colors.amber, 
        
        // The Sage: desaturates the bright neon greens into a subtle, earthy teal
        emerald: colors.teal, 
      }
    },
  },
  plugins: [],
}