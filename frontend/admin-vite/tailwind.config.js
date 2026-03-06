module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8e6",
          100: "#fce8b0",
          200: "#f8d978",
          300: "#f3c849",
          400: "#d8ad2e",
          500: "#a28012",
          600: "#7f640f",
          700: "#614c0c",
        },
        surface: {
          900: "#0b1e17",
          800: "#123227",
          700: "#1f4032",
          100: "#d9d9d6",
        },
        text: {
          primary: "#fdf5dd",
          muted: "#9ca3af",
          dark: "#000000",
        },
        "cor-fundo": "#0b1e17",
        "cor-texto": "#fdf5dd",
        "cor-titulo": "#eab308",
        "cor-primaria": "#f3c849",
        "cor-secundaria": "#1f4032",
        "cor-destaque": "#a28012",
        "cor-clara": "#d9d9d6",
        "cor-escura": "#000",
        "cor-placeholder": "#9ca3af",
      },
      borderRadius: {
        card: "1rem",
        "card-lg": "1.25rem",
      },
      boxShadow: {
        panel: "0 10px 28px rgba(0, 0, 0, 0.18)",
      },
    },
  },
  plugins: [],
};
