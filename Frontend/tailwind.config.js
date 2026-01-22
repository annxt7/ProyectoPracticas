// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. Añade esta sección de content:
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {},
  },

  plugins: [require("daisyui")],

  daisyui: {
    themes: ["lofi", "black"], 
  },
}