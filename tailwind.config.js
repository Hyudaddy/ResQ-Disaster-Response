/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff3ef',
          100: '#ffe1d5',
          200: '#ffc3ab',
          300: '#ff9f75',
          400: '#ff6e3a',
          500: '#ff5722', // Primary orange
          600: '#f23d10',
          700: '#cc2c0a',
          800: '#a9280e',
          900: '#8b2510',
          950: '#4c110a',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e0e2e7',
          200: '#c2c6d0',
          300: '#9ba2b3',
          400: '#787e93',
          500: '#5e647a',
          600: '#4a5064',
          700: '#3e4153',
          800: '#353845',
          900: '#1f2028', // Main dark background
          950: '#13141a',
        },
        light: {
          50: '#ffffff',
          100: '#f8f9fa',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
          950: '#1a1e21',
        },
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          500: '#eab308',
          600: '#ca8a04',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
        info: {
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
};