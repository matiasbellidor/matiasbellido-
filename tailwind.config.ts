import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Variables que cambian con el tema (dark: cyan/azul, light: verde).
           rgb(var / <alpha>) para que funcionen text-cyan/30, bg-electric/10… */
        electric: "rgb(var(--accent-electric) / <alpha-value>)",
        cyan: "rgb(var(--accent-cyan) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgb(var(--accent-cyan) / 0.35)",
        "glow-lg": "0 0 60px rgb(var(--accent-electric) / 0.45)",
      },
    },
  },
  plugins: [
    /* can-hover: solo con mouse. En el celular un toque deja el :hover
       pegado (zoom, brillo). Uso: can-hover:hover:shadow-glow */
    plugin(({ addVariant }) => {
      addVariant("can-hover", "@media (hover: hover) and (pointer: fine)");
    }),
  ],
};

export default config;