import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mdt: {
          blue: "#0057D9",
          red: "#FF3333",
          yellow: "#FFCC00",
          bg: "#FFFFFF",
          "bg-soft": "#F9FAFB",
          border: "#E5E7EB",
          text: "#0F172A",
          muted: "#6B7280",
          // dark
          "bg-dark": "#0B1220",
          "bg-soft-dark": "#0F172A",
          "border-dark": "#1F2A3D",
          "text-dark": "#E5E7EB",
          "muted-dark": "#9CA3AF",
          success: "#16A34A",
          danger: "#EF4444",
        },
      },
      borderRadius: {
        "mdt-sm": "6px",
        "mdt-md": "10px",
        "mdt-lg": "16px",
        "mdt-pill": "999px",
      },
      boxShadow: {
        "mdt-sm": "0 1px 3px rgba(15,23,42,0.06)",
        "mdt-md": "0 4px 12px rgba(15,23,42,0.12)",
        "mdt-btn": "0 2px 6px rgba(0,87,217,0.25)",
        "mdt-btn-hover": "0 4px 10px rgba(0,87,217,0.35)",
      },
      transitionDuration: {
        "mdt-fast": "120ms",
        "mdt-base": "180ms",
        "mdt-slow": "260ms",
      },
      transitionTimingFunction: {
        "mdt-emphasized": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["2.25rem", { lineHeight: "1.2", fontWeight: "600" }],
        h1: ["1.875rem", { lineHeight: "1.25", fontWeight: "600" }],
        h2: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["1.25rem", { lineHeight: "1.3", fontWeight: "500" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};

export default config;
