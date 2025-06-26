/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#dce4ff',
          200: '#c0ccff',
          300: '#a1a9ff',
          400: '#8685fa',
          500: '#7a62ef',
          600: '#6e42e0',
          700: '#5e32c5',
          800: '#4c2c9f',
          900: '#412a7e',
          950: '#261655'
        },
        secondary: {
          50: '#f0fdf5',
          100: '#dcfce9',
          200: '#bbf7d7',
          300: '#86efb9',
          400: '#4ade95',
          500: '#21c373',
          600: '#16a35c',
          700: '#15834c',
          800: '#166841',
          900: '#135538',
          950: '#073022'
        },
        accent: {
          50: '#fff8ed',
          100: '#ffefd3',
          200: '#ffdca6',
          300: '#fec46b',
          400: '#fda834',
          500: '#fc8c0f',
          600: '#ed6b06',
          700: '#c44e08',
          800: '#9c3d0f',
          900: '#7e340f',
          950: '#431806'
        },
        neutral: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#d9dadf',
          300: '#b9bcc6',
          400: '#9295a4',
          500: '#757887',
          600: '#60626f',
          700: '#4e505a',
          800: '#343540',
          900: '#24252d',
          950: '#131419'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-in-out',
        'slide-right': 'slideRight 0.3s ease-in-out',
        'slide-left': 'slideLeft 0.3s ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
};