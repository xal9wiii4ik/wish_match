/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        13: "3.25rem",
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        accent: {
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
        },
        surface: {
          DEFAULT: "#0f172a",
          card: "#1e293b",
          muted: "#334155",
          border: "#334155",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        glow: "0 20px 60px -15px rgba(99, 102, 241, 0.45)",
        card: "0 10px 40px -12px rgba(0, 0, 0, 0.45)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};
