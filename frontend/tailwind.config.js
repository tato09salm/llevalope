/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta LlevaloPe
        azul: {
          oscuro: '#0D1B2A',
          corp: '#1B263B',
          DEFAULT: '#0D1B2A',
        },
        teal: {
          DEFAULT: '#006D77',
          claro: '#83C5BE',
        },
        dorado: {
          DEFAULT: '#D4AF37',
          claro: '#F0D060',
          oscuro: '#B8941A',
        },
        crema: '#F5F3EE',
        gris: {
          elegante: '#7A7D85',
          claro: '#F0EEE9',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-lleva': 'linear-gradient(135deg, #0D1B2A 0%, #1B263B 50%, #006D77 100%)',
        'gradient-dorado': 'linear-gradient(135deg, #D4AF37 0%, #F0D060 100%)',
      },
      boxShadow: {
        'premium': '0 20px 60px rgba(13, 27, 42, 0.15)',
        'card': '0 4px 20px rgba(13, 27, 42, 0.08)',
        'hover': '0 8px 30px rgba(13, 27, 42, 0.15)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'pulse-dorado': 'pulseDorado 2s infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseDorado: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(212, 175, 55, 0)' },
        },
      },
    },
  },
  plugins: [],
};
