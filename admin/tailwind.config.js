/** @type {import('tailwindcss').Config} */
export default {
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
        background: '#0c0d10',
        foreground: '#ffffff',
        card: '#1a1b1e',
        'card-foreground': '#ffffff',
        popover: '#1a1b1e',
        'popover-foreground': '#ffffff',
        primary: '#ccff00',
        'primary-foreground': '#000000',
        secondary: '#27272a',
        'secondary-foreground': '#ffffff',
        muted: '#27272a',
        'muted-foreground': '#9ca3af',
        accent: '#27272a',
        'accent-foreground': '#ffffff',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
        border: '#3f3f46',
        input: '#3f3f46',
        ring: '#ccff00',
        chart: {
          '1': '#ccff00',
          '2': '#3b82f6',
          '3': '#10b981',
          '4': '#f59e0b',
          '5': '#ef4444',
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
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
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
