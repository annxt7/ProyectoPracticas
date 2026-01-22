import daisyui from "daisyui" // Asegúrate de importar el plugin

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["light", "dark", "cupcake", "synthwave", "retro", "aqua"],
  },
  plugins: [daisyui], 
}