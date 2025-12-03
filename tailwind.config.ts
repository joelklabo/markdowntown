import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
    "./src/stories/**/*.{js,ts,jsx,tsx,mdx}",
    "./.storybook/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mdt: {
          primary: "var(--mdt-color-primary)",
          "primary-strong": "var(--mdt-color-primary-strong)",
          "primary-soft": "var(--mdt-color-primary-soft)",
          accent: "var(--mdt-color-accent)",
          "accent-soft": "var(--mdt-color-accent-soft)",
          success: "var(--mdt-color-success)",
          warning: "var(--mdt-color-warning)",
          danger: "var(--mdt-color-danger)",
          info: "var(--mdt-color-info)",
          surface: "var(--mdt-color-surface)",
          "surface-subtle": "var(--mdt-color-surface-subtle)",
          "surface-strong": "var(--mdt-color-surface-strong)",
          "surface-raised": "var(--mdt-color-surface-raised)",
          overlay: "var(--mdt-color-overlay)",
          border: "var(--mdt-color-border)",
          "border-strong": "var(--mdt-color-border-strong)",
          ring: "var(--mdt-color-ring)",
          text: "var(--mdt-color-text)",
          muted: "var(--mdt-color-text-muted)",
          "text-subtle": "var(--mdt-color-text-subtle)",
          "text-on-strong": "var(--mdt-color-text-on-strong)",
          // legacy aliases for compatibility
          blue: "var(--mdt-color-primary)",
          red: "var(--mdt-color-danger)",
          yellow: "var(--mdt-color-accent)",
          bg: "var(--mdt-color-bg)",
          "bg-soft": "var(--mdt-color-surface-subtle)",
        },
      },
      borderRadius: {
        "mdt-sm": "var(--radius-sm)",
        "mdt-md": "var(--radius-md)",
        "mdt-lg": "var(--radius-lg)",
        "mdt-pill": "var(--radius-pill)",
      },
      boxShadow: {
        "mdt-sm": "var(--mdt-shadow-sm)",
        "mdt-md": "var(--mdt-shadow-md)",
        "mdt-lg": "var(--mdt-shadow-lg)",
        "mdt-focus": "var(--mdt-shadow-focus)",
        "mdt-glow": "var(--mdt-shadow-glow)",
        "mdt-btn": "0 2px 6px hsl(198 85% 52% / 0.28)",
        "mdt-btn-hover": "0 4px 10px hsl(198 85% 52% / 0.38)",
      },
      transitionDuration: {
        "mdt-fast": "var(--mdt-motion-fast)",
        "mdt-base": "var(--mdt-motion-base)",
        "mdt-slow": "var(--mdt-motion-slow)",
      },
      transitionTimingFunction: {
        "mdt-standard": "var(--mdt-motion-ease-standard)",
        "mdt-emphasized": "var(--mdt-motion-ease-emphasized)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
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
      spacing: {
        "mdt-1": "var(--space-1)",
        "mdt-2": "var(--space-2)",
        "mdt-3": "var(--space-3)",
        "mdt-4": "var(--space-4)",
        "mdt-5": "var(--space-5)",
        "mdt-6": "var(--space-6)",
        "mdt-8": "var(--space-8)",
        "mdt-10": "var(--space-10)",
        "mdt-12": "var(--space-12)",
      },
    },
  },
  plugins: [],
};

export default config;
