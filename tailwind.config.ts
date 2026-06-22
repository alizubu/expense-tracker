import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      xs: '320px',
      sm: '480px',
      md: '640px',
      lg: '768px',
      xl: '1024px',
      '2xl': '1280px',
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["GeistMono", "monospace"],
      },
      colors: {
        border: {
          DEFAULT: "var(--border-default)",
          hover: "var(--border-strong)",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "var(--accent-color)",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "var(--bg-surface)",
          foreground: "hsl(var(--card-foreground))",
        },
        page: "var(--bg-base)",
        "card-elevated": "var(--bg-elevated)",
        "card-hover": "var(--bg-hover)",
        "accent-dim": "var(--accent-glow)",
        "dark-base": "var(--bg-base)",
        "dark-card": "var(--bg-surface)",
        "dark-border": "var(--border-subtle)",
        brand: {
          purple: "var(--accent-color)",
          "purple-light": "var(--accent-light)",
        },
        income: "var(--green)",
        expense: "var(--red)",
        transfer: "#3B82F6",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
      },
      letterSpacing: {
        heading: "-0.02em",
      },
      lineHeight: {
        body: "1.6",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 -1px 0 rgba(0,0,0,0.3) inset",
        "card-hover": "0 0 0 1px rgba(124,58,237,0.10) inset",
      },
      keyframes: {
        gradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
        "shimmer-slide": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "border-beam-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "sparkle-spin": {
          "0%": { transform: "rotate(0deg) scale(0)", opacity: "0" },
          "50%": { transform: "rotate(180deg) scale(1)", opacity: "1" },
          "100%": { transform: "rotate(360deg) scale(0)", opacity: "0" },
        },
        "slide-in": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-out-left": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(-100%)", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        gradient: "gradient 8s linear infinite",
        meteor: "meteor 5s linear infinite",
        "shimmer-slide": "shimmer-slide 3s ease-in-out infinite",
        "border-beam-spin": "border-beam-spin 12s linear infinite",
        "sparkle-spin": "sparkle-spin 1.5s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-out-left": "slide-out-left 0.3s ease-in forwards",
        "fade-in": "fade-in 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
