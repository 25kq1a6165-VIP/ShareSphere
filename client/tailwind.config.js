/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5fc',
          100: '#e1ecf9',
          200: '#c3dbf4',
          300: '#94c0ec',
          400: '#5e9ee0',
          500: '#387fd4',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e3a8a', // classic deep navy
          900: '#0f2452', // deep midnight navy
          950: '#0a1735',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(15, 36, 82, 0.08), 0 8px 10px -6px rgba(15, 36, 82, 0.04)',
      }
    },
  },
  plugins: [],
}
