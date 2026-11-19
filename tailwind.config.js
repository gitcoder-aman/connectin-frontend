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
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a8f7',
          500: '#0e8ce8',
          600: '#0a66c2', // LinkedIn Primary Blue
          700: '#004182',
          800: '#053468',
          900: '#0a2d54',
          950: '#071d37',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 0 0 1px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 0 0 1px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
        'dropdown': '0 4px 20px -2px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
