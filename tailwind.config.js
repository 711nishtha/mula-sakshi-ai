/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#07070f",
        deep: "#0d0d1a",
        surface: "#12121f",
        panel: "#16162a",
        border: "#1e1e38",
        "border-bright": "#2a2a50",
        gold: {
          DEFAULT: "#D4A853",
          dim: "#a07830",
          bright: "#f0c878",
          glow: "#D4A85340",
        },
        violet: {
          DEFAULT: "#6C63FF",
          dim: "#4a44c0",
          bright: "#9d97ff",
          glow: "#6C63FF30",
        },
        teal: {
          DEFAULT: "#2EC4B6",
          dim: "#1d9b8f",
          bright: "#5ce8da",
          glow: "#2EC4B625",
        },
        red: {
          audit: "#e8445a",
          "audit-glow": "#e8445a25",
        },
        green: {
          audit: "#34d399",
          "audit-glow": "#34d39920",
        },
        text: {
          primary: "#F5F5F5",
          secondary: "#9896b0",
          muted: "#55536a",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Outfit'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gold-gradient": "linear-gradient(135deg, #D4A853 0%, #f0c878 50%, #a07830 100%)",
        "violet-gradient": "linear-gradient(135deg, #4a44c0 0%, #6C63FF 50%, #9d97ff 100%)",
        "teal-gradient": "linear-gradient(135deg, #1d9b8f 0%, #2EC4B6 50%, #5ce8da 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "scan": "scan 3s linear infinite",
        "grain": "grain 0.5s steps(1) infinite",
        "meter-fill": "meterFill 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "counter": "counter 1.5s ease-out forwards",
        "reveal": "reveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer": "shimmer 2s linear infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        pulseGlow: {
          "0%, 100%": { opacity: 0.6 },
          "50%": { opacity: 1 },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        grain: {
          "0%, 100%": { backgroundPosition: "0 0" },
          "10%": { backgroundPosition: "-5% -10%" },
          "30%": { backgroundPosition: "-15% 5%" },
          "50%": { backgroundPosition: "7% -25%" },
          "70%": { backgroundPosition: "20% 25%" },
          "90%": { backgroundPosition: "-15% 30%" },
        },
        meterFill: {
          "0%": { strokeDashoffset: "283" },
          "100%": { strokeDashoffset: "var(--target-offset)" },
        },
        reveal: {
          "0%": { opacity: 0, transform: "translateY(16px) scale(0.98)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
