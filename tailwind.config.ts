import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        border: "hsl(150 10% 90%)",
        input: "hsl(150 10% 92%)",
        ring: "hsl(152 45% 55%)",
        background: "hsl(150 15% 97%)",
        foreground: "hsl(160 25% 20%)",
        primary: {
          DEFAULT: "hsl(152 45% 55%)",
          foreground: "hsl(0 0% 100%)",
          light: "hsl(152 45% 95%)",
        },
        secondary: {
          DEFAULT: "hsl(160 30% 94%)",
          foreground: "hsl(160 25% 25%)",
        },
        destructive: {
          DEFAULT: "hsl(0 45% 70%)",
          foreground: "hsl(0 0% 100%)",
        },
        muted: {
          DEFAULT: "hsl(150 15% 94%)",
          foreground: "hsl(160 15% 45%)",
        },
        accent: {
          DEFAULT: "hsl(165 35% 92%)",
          foreground: "hsl(160 25% 25%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(160 25% 20%)",
        },
        sage: {
          50: "hsl(150 20% 97%)",
          100: "hsl(150 20% 94%)",
          200: "hsl(150 18% 88%)",
          300: "hsl(150 16% 78%)",
          400: "hsl(150 14% 60%)",
          500: "hsl(152 45% 55%)",
          600: "hsl(152 40% 45%)",
          700: "hsl(152 35% 35%)",
          800: "hsl(152 30% 25%)",
          900: "hsl(152 25% 18%)",
        },
        mint: {
          50: "hsl(165 40% 97%)",
          100: "hsl(165 40% 94%)",
          200: "hsl(165 35% 88%)",
          300: "hsl(165 30% 78%)",
          400: "hsl(165 25% 65%)",
          500: "hsl(165 35% 55%)",
        },
        warm: {
          50: "hsl(40 30% 97%)",
          100: "hsl(40 25% 94%)",
          200: "hsl(40 20% 88%)",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 4px 12px -4px rgba(0, 0, 0, 0.06), 0 8px 24px -8px rgba(0, 0, 0, 0.06)',
        'soft-xl': '0 8px 24px -8px rgba(0, 0, 0, 0.08), 0 16px 48px -16px rgba(0, 0, 0, 0.08)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'pulse-gentle': 'pulse-gentle 2.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.25s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      keyframes: {
        'pulse-gentle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.03)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
};
export default config;
