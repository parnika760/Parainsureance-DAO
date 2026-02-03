module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        dark: {
          900: '#0f1419',
          800: '#1a1f2e',
          700: '#252d3d',
        }
      },
      backdropFilter: {
        'none': 'none',
        'sm': 'blur(4px)',
        'md': 'blur(12px)',
        'lg': 'blur(40px)',
      },
      backgroundColor: {
        'glass': 'rgba(15, 20, 25, 0.8)',
        'glass-light': 'rgba(26, 31, 46, 0.7)',
      },
      borderColor: {
        'glass': 'rgba(52, 211, 153, 0.2)',
      }
    },
  },
  plugins: [],
}
