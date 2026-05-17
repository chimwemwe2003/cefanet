import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0284c7",
          600: "#0369a1",
          700: "#075985",
          900: "#0c4a6e",
        },
        zambia: {
          green: "#198a00",
          red: "#de2010",
          orange: "#ef7d00",
          black: "#000000",
        },
        // Refined ministry emerald (Tailwind-style perceptual ramp)
        ministry: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          500: "#64748b",
          700: "#334155",
          900: "#0f172a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ['"Source Serif Pro"', '"Playfair Display"', "Georgia", "serif"],
      },
      boxShadow: {
        ministry: "0 1px 2px rgba(15, 23, 42, .04), 0 1px 3px rgba(15, 23, 42, .08)",
        "ministry-lg": "0 10px 32px -10px rgba(27, 94, 32, .25)",
      },
    },
  },
  plugins: [],
};

export default config;
