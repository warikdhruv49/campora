/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#07090d',
          900: '#0a0d12',
          850: '#0d1117',
          800: '#10151c',
          750: '#141a23',
          700: '#1a212b',
        },
        stroke: {
          DEFAULT: '#1c2530',
          strong: '#2a3542',
        },
        txt: {
          primary: '#e8edf4',
          secondary: '#94a0b0',
          muted: '#5c6878',
        },
        gain: {
          DEFAULT: '#00d492',
          dim: 'rgba(0, 212, 146, 0.12)',
        },
        loss: {
          DEFAULT: '#ff5b66',
          dim: 'rgba(255, 91, 102, 0.12)',
        },
        brand: {
          DEFAULT: '#00d492',
          blue: '#4d8dff',
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)',
        glow: '0 0 24px -6px rgba(0, 212, 146, 0.25)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '-400px 0' },
          to: { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.18s ease-out',
        slideUp: 'slideUp 0.22s ease-out',
        scaleIn: 'scaleIn 0.16s ease-out',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
