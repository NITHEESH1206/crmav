import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        // Aetherfield's exact stack: Radio Canada Big sans + Geist Mono + Source Serif
        sans:    ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ["var(--font-mono)", "ui-monospace", "monospace"],
        serif:   ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // Signal — ZynexAV brand accent
        signal: {
          50:  "#fff2ec",
          100: "#ffe0d1",
          200: "#ffbf9c",
          300: "#ff9c66",
          400: "#ff7d3f",
          500: "#ff5a1f",
          600: "#e64710",
          700: "#b8350c",
          800: "#8a2509",
          900: "#5c1806",
        },
        // Ink — background tiers
        ink: {
          50:  "#1a1a1d",
          100: "#131316",
          200: "#0f0f12",
          300: "#0a0a0a", // base canvas
          400: "#050505",
          500: "#000000",
        },
        // Bone — warm off-white for light surfaces
        bone: {
          50:  "#fafaf6",
          100: "#f4f2ec",
          200: "#ebe7dd",
          300: "#ddd6c8",
          400: "#c4baa8",
          500: "#a59986",
          600: "#7a705f",
          700: "#574f43",
        },
        // ── Semantic status colors (muted, never compete with Signal) ──
        // Use these instead of vivid amber/red/emerald for status pills.
        status: {
          "success-bg": "#E8F4EC",
          "success-fg": "#11703A",
          "warning-bg": "#FBF1E1",
          "warning-fg": "#8A5F0A",
          "danger-bg":  "#FBE9E7",
          "danger-fg":  "#A8201A",
          "info-bg":    "#E8EEF6",
          "info-fg":    "#1F3A6B",
          "neutral-bg": "#F1EFE9",
          "neutral-fg": "#3F3B33",
        },
        // Surface tokens for clean light-mode hierarchy
        surface: {
          raised:  "#FFFFFF",
          muted:   "#FAFAF6",
          sunken:  "#F4F2EC",
          inverse: "#0A0A0A",
        },
      },
      // ── Typography scale — Aetherfield's exact ladder ──
      //  Display 80 / 64 / 40 · Heading 36 / 32 / 24 · Body 20 / 18 / 16 / 14
      //  Letter-spacing tightens as size grows. Radio Canada Big runs Medium
      //  (500) for headings — heavier than 600 looks chunky in this typeface.
      fontSize: {
        "display-2xl": ["80px", { lineHeight: "1.04", letterSpacing: "-0.03em", fontWeight: "500" }],
        "display-xl":  ["64px", { lineHeight: "1.05", letterSpacing: "-0.028em", fontWeight: "500" }],
        "display-lg":  ["40px", { lineHeight: "1.08", letterSpacing: "-0.024em", fontWeight: "500" }],
        "heading-lg":  ["36px", { lineHeight: "1.1",  letterSpacing: "-0.02em",  fontWeight: "500" }],
        "heading-md":  ["32px", { lineHeight: "1.12", letterSpacing: "-0.018em", fontWeight: "500" }],
        "heading-sm":  ["24px", { lineHeight: "1.2",  letterSpacing: "-0.014em", fontWeight: "500" }],
        "body-lg":     ["20px", { lineHeight: "1.5",  letterSpacing: "-0.005em", fontWeight: "400" }],
        "body":        ["18px", { lineHeight: "1.55", letterSpacing: "0",        fontWeight: "400" }],
        "body-md":     ["16px", { lineHeight: "1.55", letterSpacing: "0",        fontWeight: "400" }],
        "body-sm":     ["14px", { lineHeight: "1.5",  letterSpacing: "0",        fontWeight: "400" }],
        "caption":     ["13px", { lineHeight: "1.45", letterSpacing: "0",        fontWeight: "400" }],
        "micro":       ["11px", { lineHeight: "1.3",  letterSpacing: "0.16em",   fontWeight: "500" }],
        "mono-num":    ["13px", { lineHeight: "1.4",  letterSpacing: "0",        fontWeight: "400" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "signal-radial":
          "radial-gradient(circle at 20% 10%, rgba(255,90,31,0.18), transparent 40%), radial-gradient(circle at 80% 90%, rgba(255,90,31,0.12), transparent 50%)",
        "signal-mesh":
          "radial-gradient(at 12% 8%, rgba(255,90,31,0.22) 0px, transparent 50%), radial-gradient(at 90% 20%, rgba(255,125,63,0.16) 0px, transparent 50%), radial-gradient(at 40% 95%, rgba(255,90,31,0.18) 0px, transparent 50%)",
        "grid-fade":
          "linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "shine":
          "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(255,90,31,0.55), 0 0 80px -20px rgba(255,90,31,0.35)",
        "glow-sm": "0 0 22px -6px rgba(255,90,31,0.6)",
        soft: "0 10px 40px -10px rgba(0,0,0,0.55)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.04), 0 20px 50px -20px rgba(0,0,0,0.6)",
        "card-hover":
          "0 1px 0 0 rgba(255,255,255,0.08) inset, 0 0 0 1px rgba(255,90,31,0.25), 0 30px 60px -20px rgba(0,0,0,0.7), 0 0 30px -8px rgba(255,90,31,0.35)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-18px,0)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "scroll-x": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,90,31,0.45)" },
          "50%": { boxShadow: "0 0 0 4px rgba(255,90,31,0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2.4s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        glow: "glow 3.6s ease-in-out infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        "scroll-x": "scroll-x 40s linear infinite",
        "fade-up": "fade-up 0.8s ease-out both",
        "pulse-soft": "pulse-soft 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
