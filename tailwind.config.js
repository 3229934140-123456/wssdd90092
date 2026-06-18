/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#e8f0f8",
          100: "#c5d6e8",
          200: "#9db9d6",
          300: "#749cc4",
          400: "#5685b6",
          500: "#396ea8",
          600: "#2d5a8e",
          700: "#1e3a5f",
          800: "#162b46",
          900: "#0f1d30",
        },
        warning: {
          50: "#fdf4e8",
          100: "#fae2c4",
          200: "#f6cc98",
          300: "#f2b56d",
          400: "#eca44c",
          500: "#e67e22",
          600: "#d35400",
          700: "#a04000",
          800: "#6e2c00",
          900: "#3d1800",
        },
        success: {
          50: "#eafaf1",
          100: "#c9f0d8",
          200: "#a3e4bd",
          300: "#7dd8a2",
          400: "#5ece8b",
          500: "#27ae60",
          600: "#1e8449",
          700: "#145a32",
          800: "#0b3d21",
          900: "#051f11",
        },
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      fontFamily: {
        sans: [
          "Source Han Sans CN",
          "Source Han Sans SC",
          "PingFang SC",
          "Microsoft YaHei",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 12px -2px rgba(30, 58, 95, 0.08), 0 1px 4px -1px rgba(30, 58, 95, 0.06)",
        "card-hover": "0 8px 30px -6px rgba(30, 58, 95, 0.15), 0 4px 12px -2px rgba(30, 58, 95, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
