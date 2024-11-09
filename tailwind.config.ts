import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme colors
        light: {
          background: '#ffffff',
          foreground: '#000000',
          primary: '#3b82f6',
          secondary: '#64748b',
          accent: '#f59e0b',
        },
        // Dark theme colors
        dark: {
          background: '#1a1a1a',
          foreground: '#ffffff',
          primary: '#60a5fa',
          secondary: '#94a3b8',
          accent: '#fbbf24',
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundColor: {
        'primary': 'var(--background)',
        'secondary': 'var(--foreground)',
      },
      textColor: {
        'primary': 'var(--foreground)',
        'secondary': 'var(--background)',
      },
      keyframes: {
        // Dropdown menu animations
        slideDownAndFade: {
          from: { opacity: '0', transform: 'translateY(-2px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpAndFade: {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(-2px)' },
        },
        
        // Modal animations
        overlayShow: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        contentShow: {
          from: { 
            opacity: '0', 
            transform: 'translate(-50%, -48%) scale(0.96)'
          },
          to: { 
            opacity: '1', 
            transform: 'translate(-50%, -50%) scale(1)'
          },
        },
        "fade-in-80": {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        // Dropdown animations
        slideDownAndFade: 'slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        slideUpAndFade: 'slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        
        // Modal animations
        overlayShow: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        contentShow: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        "in": "fade-in-80 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
