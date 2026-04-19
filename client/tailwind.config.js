/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/app/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "Fira Code", "monospace"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "sans-serif"],
      },
      colors: {
        terminal: {
          bg: "#0a0e14",
          surface: "#0d1117",
          border: "#1e2630",
          green: "#7ee787",
          cyan: "#39d0d0",
          yellow: "#e3b341",
          red: "#ff7b72",
          blue: "#79c0ff",
          gray: "#8b949e",
          white: "#cdd9e5",
        },
      },
      animation: {
        "cursor-blink": "blink 1.2s step-end infinite",
        "fade-in": "fadeIn 0.6s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
        "type-in": "typeIn 0.03s steps(1) forwards",
        "scan": "scan 4s linear infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0 } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        glow: {
          from: { textShadow: "0 0 4px #7ee787" },
          to: { textShadow: "0 0 12px #7ee787, 0 0 24px #7ee78755" },
        },
      },
      boxShadow: {
        terminal: "0 0 0 1px #1e2630, 0 25px 50px -12px rgba(0,0,0,0.8)",
        glow: "0 0 20px rgba(126, 231, 135, 0.15)",
        "glow-strong": "0 0 40px rgba(126, 231, 135, 0.25)",
      },
    },
  },
  plugins: [],
};
