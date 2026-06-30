/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          'primary-dark': 'var(--brand-primary-dark)',
          secondary: 'var(--brand-secondary)',
          success: 'var(--brand-success)',
          cta: 'var(--brand-cta)',
          background: 'var(--brand-background)',
          surface: 'var(--brand-surface)',
          border: 'var(--brand-border)',
          'text-primary': 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
        },
        accent: {
          teal: 'var(--accent-teal)',
          'teal-dark': 'var(--accent-teal-dark)',
          orange: 'var(--accent-orange)',
          purple: 'var(--accent-purple)',
          pink: 'var(--accent-pink)',
          plum: 'var(--accent-plum)',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(108,29,95,0.06)',
        'card-hover': '0 4px 20px rgba(108,29,95,0.12)',
        modal: '0 25px 50px -12px rgba(0,0,0,0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
