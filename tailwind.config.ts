import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FAF7F2",
          dark: "#F5F0E8",
          darker: "#EDE5D8",
        },
        forest: {
          DEFAULT: "#1F3A2E",
          light: "#2D5241",
          pale: "#4A7060",
        },
        cacao: {
          DEFAULT: "#3D2817",
          light: "#6B4532",
        },
        terracotta: {
          DEFAULT: "#C97B63",
          light: "#E0A896",
          dark: "#A55C45",
        },
        burgundy: {
          DEFAULT: "#7A2E2E",
          light: "#9E4040",
          pale: "#C07070",
        },
        gold: {
          DEFAULT: "#B8935A",
          light: "#D4AF78",
          pale: "#E8D5B0",
        },
        ink: {
          DEFAULT: "#1A1614",
          soft: "#2E2621",
        },
        petal: {
          50: "#FDF5F0",
          100: "#FAE8E0",
          200: "#F5CFC0",
          300: "#EEB09A",
          400: "#E49078",
          500: "#D97058",
          600: "#C95640",
          700: "#A54030",
          800: "#7A2E20",
          900: "#501E14",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 6vw, 5.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.25rem, 4vw, 4rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.75rem)", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-sm": ["clamp(1.5rem, 2.5vw, 2rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
      },
      letterSpacing: {
        widest: "0.2em",
        wider: "0.1em",
        "brand": "0.08em",
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "10px",
        xl: "14px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        "fine": "0 1px 3px 0 rgba(31, 58, 46, 0.06), 0 1px 2px 0 rgba(31, 58, 46, 0.04)",
        "card": "0 2px 8px 0 rgba(31, 58, 46, 0.08), 0 1px 3px 0 rgba(31, 58, 46, 0.04)",
        "card-hover": "0 8px 24px 0 rgba(31, 58, 46, 0.12), 0 2px 8px 0 rgba(31, 58, 46, 0.06)",
        "editorial": "0 16px 48px 0 rgba(31, 58, 46, 0.14)",
        "inner-fine": "inset 0 1px 3px 0 rgba(31, 58, 46, 0.08)",
      },
      backgroundImage: {
        "grain": "url('/textures/grain.png')",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "pulse-subtle": "pulseSubtle 2.5s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSubtle: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.04)", opacity: "0.9" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      transitionTimingFunction: {
        "elegant": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "bounce-out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
    },
  },
  plugins: [],
};

export default config;
