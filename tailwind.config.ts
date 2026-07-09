import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: "#05070F",
          800: "#0A0E1A",
          700: "#111629",
          600: "#1A2138",
        },
        tether: {
          DEFAULT: "#26A17B",
          light: "#3FD69B",
          dark: "#1B7A5C",
        },
        cyanglow: "#00E5FF",
        violetglow: "#7B2FF7",
        gold: "#FFD700",
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Skeuomorphic depth: dark drop + light inset highlight
        skeu: "0 10px 30px -8px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(255,255,255,0.08)",
        "skeu-pressed":
          "0 2px 8px -4px rgba(0,0,0,0.8), inset 0 2px 6px 0 rgba(0,0,0,0.6)",
        "glow-tether": "0 0 24px -4px rgba(38,161,123,0.6)",
        "glow-cyan": "0 0 24px -4px rgba(0,229,255,0.55)",
        "glow-gold": "0 0 28px -4px rgba(255,215,0,0.55)",
      },
      backgroundImage: {
        "turf": "repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 2px, transparent 2px, transparent 22px)",
        "metal": "linear-gradient(145deg, #1A2138 0%, #111629 45%, #0A0E1A 100%)",
        "glass": "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
      },
      keyframes: {
        sheen: {
          "0%": { transform: "translateX(-120%) skewX(-20deg)" },
          "100%": { transform: "translateX(220%) skewX(-20deg)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseglow: {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        sheen: "sheen 3.5s ease-in-out infinite",
        floaty: "floaty 5s ease-in-out infinite",
        pulseglow: "pulseglow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
