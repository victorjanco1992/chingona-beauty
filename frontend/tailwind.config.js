/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#C8205A", dark: "#9E1747", light: "#F7DCE6" },
        gold: { DEFAULT: "#B98A3E", light: "#E8D2A6" },
        cream: "#FFF8F1",
        ink: "#1A1416",
      },
      fontFamily: {
        display: ['"Playfair Display"', "serif"],
        script: ['"Great Vibes"', "cursive"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
