// tailwind.config.js

module.exports = {

  plugins: [require("daisyui")],
  
 daisyui: {
    themes: [
      "light", 
      "dark", 
      "cupcake", 
      "bumblebee", 
      "emerald", 
      "corporate",
      
      {
        tribe: {
          "primary": "#570df8",
          "secondary": "#f000b8",
          "accent": "#37cdbe",
          "neutral": "#3d4451",
          "base-100": "#ffffff",
        },
      },
    ],
  },
}