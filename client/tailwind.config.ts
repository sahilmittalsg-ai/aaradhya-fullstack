import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Montserrat", "Poppins", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        sandal: "#f8efe1",
        saffron: "#b96a22",
        rudra: "#5f331f",
        ink: "#1f1a17"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(95, 51, 31, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
