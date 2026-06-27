/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Syne", "Inter", "sans-serif"],
      },
      colors: {
        dark: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          800: "#1e293b",
          850: "#172033",
          900: "#0f172a",
          950: "#0a0a0f",
        },
      },
      animation: {
        "float":      "float 4s ease-in-out infinite",
        "shimmer":    "shimmer 3s linear infinite",
        "slide-up":   "slide-up 0.6s ease forwards",
        "scale-in":   "scale-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "spin-slow":  "spin 2s linear infinite",
      },
      backdropBlur: { xs: "2px" },
      boxShadow: {
        "glow-sm":  "0 0 15px rgba(99,102,241,0.3)",
        "glow-md":  "0 0 30px rgba(99,102,241,0.4)",
        "glow-lg":  "0 0 60px rgba(99,102,241,0.5)",
        "card":     "0 4px 24px rgba(0,0,0,0.4)",
        "card-hover":"0 20px 60px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
