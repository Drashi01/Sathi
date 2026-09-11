/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0B0F19',
          card: '#131B2E',
          border: '#1E293B',
          accent: '#00F0FF',
          purple: '#A855F7',
          pink: '#EC4899',
          green: '#10B981',
          yellow: '#F59E0B',
          red: '#EF4444',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'neon-red': '0 0 15px rgba(239, 68, 68, 0.5)',
        'neon-green': '0 0 15px rgba(16, 185, 129, 0.4)',
      }
    },
  },
  plugins: [],
}
