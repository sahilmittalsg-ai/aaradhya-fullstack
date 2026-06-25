import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#17172a",
        admin: "#211d33",
        cream: "#fbf2e3",
        sand: "#f6e8ce",
        saffron: "#b96a22"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(23, 23, 42, 0.10)"
      }
    }
  },
  plugins: []
} satisfies Config;
