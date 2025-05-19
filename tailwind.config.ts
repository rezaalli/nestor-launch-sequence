import type { Config } from "tailwindcss";
import { tailwindGoldenSpacing } from "./src/styles/golden-ratio-spacing";

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Neutral colors (60% of system)
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0a0c10',
        },
        
        // Brand colors (30% of system)
        brand: {
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a', // Main Nestor blue
            950: '#172554',
          },
          teal: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
            950: '#042f2e',
          },
        },
        
        // Status colors (10% of system)
        status: {
          success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e', // Main success
            600: '#16a34a',
            700: '#15803d',
          },
          warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b', // Main warning
            600: '#d97706',
            700: '#b45309',
          },
          error: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444', // Main error
            600: '#dc2626',
            700: '#b91c1c',
          },
          info: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6', // Main info
            600: '#2563eb',
            700: '#1d4ed8',
          },
        },
        
        // Adaptive color themes for time of day
        morning: {
          bg: 'hsl(48, 100%, 97%)',
          fg: 'hsl(222.2, 84%, 4.9%)',
          primary: 'hsl(24, 85%, 40%)',
          muted: 'hsl(48, 50%, 94%)',
        },
        day: {
          bg: 'hsl(210, 100%, 98%)',
          fg: 'hsl(222.2, 84%, 4.9%)',
          primary: 'hsl(210, 85%, 40%)',
          muted: 'hsl(210, 50%, 95%)',
        },
        evening: {
          bg: 'hsl(261, 50%, 98%)',
          fg: 'hsl(222.2, 84%, 4.9%)',
          primary: 'hsl(261, 70%, 40%)',
          muted: 'hsl(261, 20%, 95%)',
        },
        night: {
          bg: 'hsl(222.2, 20%, 7%)',
          fg: 'hsl(210, 30%, 90%)',
          primary: 'hsl(220, 60%, 65%)',
          muted: 'hsl(217.2, 32.6%, 14%)',
        },
        
        // Keep existing color tokens for backward compatibility
        nestor: {
          blue: "#1e3a8a",
          gray: {
            400: "#9ca3af",
            500: "#6b7280",
            600: "#4b5563",
            700: "#374151",
            800: "#1f2937",
            900: "#111827",
          }
        },
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
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontSize: {
        '2xs': '0.625rem',   // 10px
        xs: '0.75rem',       // 12px
        sm: '0.875rem',      // 14px
        base: '1rem',        // 16px
        lg: '1.125rem',      // 18px
        xl: '1.25rem',       // 20px
        '2xl': '1.5rem',     // 24px
        '3xl': '1.875rem',   // 30px
        '4xl': '2.25rem',    // 36px
      },
      lineHeight: {
        'extra-tight': '1.1',
        tight: '1.2',
        snug: '1.35',
        normal: '1.5',
        relaxed: '1.625',
      },
      spacing: tailwindGoldenSpacing(),
      borderRadius: {
        none: '0',
        sm: '0.125rem',      // 2px
        DEFAULT: '0.25rem',  // 4px
        md: '0.375rem',      // 6px
        lg: '0.5rem',        // 8px
        xl: '0.75rem',       // 12px
        '2xl': '1rem',       // 16px
        '3xl': '1.5rem',     // 24px
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: 'none',
      },
      transitionDuration: {
        'instant': '0ms',
        'ultraFast': '100ms',
        'fast': '200ms',
        'normal': '300ms',
        'slow': '500ms',
        'verySlow': '800ms',
      },
      transitionTimingFunction: {
        // Standard easings
        'standard-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'standard-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'standard-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        // Emphasis easings
        'emphasis-in-out': 'cubic-bezier(0.4, 0, 0.6, 1)',
        'emphasis-accelerate': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
        'emphasis-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
        // Bounce & spring effects
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-in': 'cubic-bezier(0.22, -0.28, 0.7, 1.56)',
        'spring-out': 'cubic-bezier(0.08, 0.82, 0.17, 1)',
        'spring-in': 'cubic-bezier(0.5, 1.5, 0.8, 0.7)',
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" },
        },
        "slide-in-right": {
          from: { transform: "translateX(1.25rem)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)", opacity: "1" },
          to: { transform: "translateX(1.25rem)", opacity: "0" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-1.25rem)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out-left": {
          from: { transform: "translateX(0)", opacity: "1" },
          to: { transform: "translateX(-1.25rem)", opacity: "0" },
        },
        "slide-in-top": {
          from: { transform: "translateY(-1.25rem)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-out-top": {
          from: { transform: "translateY(0)", opacity: "1" },
          to: { transform: "translateY(-1.25rem)", opacity: "0" },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(1.25rem)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-out-bottom": {
          from: { transform: "translateY(0)", opacity: "1" },
          to: { transform: "translateY(1.25rem)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "scale-out": "scale-out 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-out-left": "slide-out-left 0.3s ease-out",
        "slide-in-top": "slide-in-top 0.3s ease-out",
        "slide-out-top": "slide-out-top 0.3s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.3s ease-out",
        "slide-out-bottom": "slide-out-bottom 0.3s ease-out",
        // Additional animations with different timing
        "fade-in-fast": "fade-in 0.2s ease-out",
        "scale-in-fast": "scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-in-bottom-bounce": "slide-in-bottom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
