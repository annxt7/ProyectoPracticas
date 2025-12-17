// tailwind.config.js

module.exports = {
  // ... otras configuraciones de Tailwind
  
  plugins: [require("daisyui")],
  
  daisyui: {
    themes: ["lofi", "black"], // "lofi" para claro minimalista, "black" para oscuro puro
  },
}