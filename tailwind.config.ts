import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        /* Apuntan a variables que viran con el tema:
           dark = cyan/azul (igual que antes), light = verde bosque.
           Formato rgb(var / <alpha>) para que funcionen los
           modificadores de opacidad (text-cyan/30, bg-electric/10). */
        electric: "rgb(var(--accent-electric) / <alpha-value>)",
        cyan: "rgb(var(--accent-cyan) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        /* Títulos: Inter, igual que hasta ahora (apuntaba a --font-jakarta,
           que no existía, y por eso ya heredaban Inter del body) */
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgb(var(--accent-cyan) / 0.35)",
        "glow-lg": "0 0 60px rgb(var(--accent-electric) / 0.45)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 3s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;