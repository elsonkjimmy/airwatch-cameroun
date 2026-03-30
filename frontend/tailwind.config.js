/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'climate-bg': '#FFFFFF',
        'climate-light': '#F8FAFC',
        'teal-accent': '#0D7377',
        'temp-cold': '#3B82F6',   // Bleu
        'temp-warm': '#F59E0B',   // Orange
        'temp-hot': '#EF4444',    // Rouge
        'deep-navy': '#0A2342',
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'badge': '8px',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
