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
          primary: "var(--mdt-color-primary)",
          "primary-strong": "var(--mdt-color-primary-strong)",
          accent: "var(--mdt-color-accent)",
          success: "var(--mdt-color-success)",
          warning: "var(--mdt-color-warning)",
          danger: "var(--mdt-color-danger)",
          info: "var(--mdt-color-info)",
          surface: "var(--mdt-color-surface)",
          "surface-subtle": "var(--mdt-color-surface-subtle)",
          border: "var(--mdt-color-border)",
          text: "var(--mdt-color-text)",
          muted: "var(--mdt-color-text-muted)",
          // legacy aliases for compatibility
          blue: "var(--mdt-color-primary)",
          red: "var(--mdt-color-danger)",
          yellow: "var(--mdt-color-accent)",
          bg: "var(--mdt-color-bg)",
          "bg-soft": "var(--mdt-color-surface-subtle)",
        },
      },
      borderRadius: {
        "mdt-sm": "6px",
        "mdt-md": "10px",
        "mdt-lg": "16px",
        "mdt-pill": "999px",
      },
      boxShadow: {
        "mdt-sm": "var(--mdt-shadow-sm)",
        "mdt-md": "var(--mdt-shadow-md)",
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
