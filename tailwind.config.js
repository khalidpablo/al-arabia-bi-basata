/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        logoDark: '#0b162c',
        logoNavy: '#112244',
        logoGold: '#d4af37',
        logoGoldHover: '#aa8c2c',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.25', transform: 'scale(1) translate(0, 0)' },
          '50%': { opacity: '0.5', transform: 'scale(1.15) translate(2%, 3%)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 10s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
