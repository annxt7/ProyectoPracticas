// tailwind.config.js

module.exports = {

  plugins: [require("daisyui")],
  
  daisyui: {
   themes: [
      {
        // TEMA LIGHT (Limpio y profesional)
        tribeLight: {
          "primary": "#570df8",          // Tu color de marca
          "secondary": "#f000b8",
          "accent": "#37cdbe",
          "neutral": "#3d4451",
          "base-100": "#ffffff",         // Fondo principal
          "base-200": "#f2f2f2",         // Fondo secundario (cards)
          "base-300": "#e5e6e6",         // Hovers/Divisores
          "base-content": "#1f2937",      // Texto principal
        },
        // TEMA DARK (El que tenías, pero optimizado)
        tribeDark: {
          "primary": "#661ae6",
          "secondary": "#d926aa",
          "accent": "#1fb2a6",
          "neutral": "#191d24",
          "base-100": "#0f172a",         // Azul muy oscuro/negro
          "base-200": "#1e293b",         // Un poco más claro para cards
          "base-300": "#334155",
          "base-content": "#f8fafc",      // Texto casi blanco
        },
        // TEMA PINK (Estilo "Cupcake" o "Cyberpunk Light")
        tribePink: {
          "primary": "#d946ef",          // Rosa vibrante
          "secondary": "#f472b6",
          "accent": "#70acc7",
          "neutral": "#4b164c",
          "base-100": "#fdf2f8",         // Fondo rosa muy pálido
          "base-200": "#fbcfe8",         // Rosa suave para cards
          "base-content": "#701a75",      // Texto color vino/morado
        },
        // TEMA GREEN (Elegante y relajado)
        tribeGreen: {
          "primary": "#10b981",          // Esmeralda
          "secondary": "#34d399",
          "accent": "#fbbf24",
          "neutral": "#064e3b",
          "base-100": "#f0fdf4",         // Fondo verde menta muy suave
          "base-200": "#dcfce7",         // Fondo para componentes
          "base-content": "#064e3b",      // Texto verde bosque
        },
        // TEMA SLATE (Gris oscuro moderno, tipo Discord/Notion)
        tribeSlate: {
          "primary": "#38bdf8",
          "secondary": "#818cf8",
          "accent": "#f472b6",
          "neutral": "#1e293b",
          "base-100": "#0f172a",
          "base-200": "#1e293b",
          "base-content": "#cbd5e1",
        },
      },
    ],
  },
}