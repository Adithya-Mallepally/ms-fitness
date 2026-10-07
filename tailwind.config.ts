import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        void: "var(--color-void)",
        obsidian: "var(--color-obsidian)",
        card: "var(--color-card)",
        cardHover: "var(--color-card-hover)",
        surface: "var(--color-surface)",
        foreground: "var(--color-foreground)",
        gold: {
          400: "#f6c358",
          500: "#e5a93c",
          600: "#ca8a24",
        },
        crimson: {
          500: "#ff2a51",
          600: "#e11d48",
        },
        borderDark: "var(--color-border)",
        borderLight: "var(--color-border-light)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "var(--font-inter)", "sans-serif"],
      },
      letterSpacing: {
        widest: "0.2em",
        mega: "0.28em",
      },
      keyframes: {
        scrollBeam: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(200%)", opacity: "0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "scroll-beam": "scrollBeam 2.2s cubic-bezier(0.65, 0, 0.35, 1) infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
