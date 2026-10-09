/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        spatial: {
          void: '#030712',          // Deep cosmic void
          slate: '#0B0F19',         // Deep void glass slate
          surface: '#111827',       // Spatial card surface
          border: 'rgba(255, 255, 255, 0.08)', // Refraction edge
          cyan: '#06B6D4',          // Neon cyan pulse
          emerald: '#10B981',       // Bioluminescent emerald
          crimson: '#F43F5E',       // Radiant crimson shockwave
          amber: '#F59E0B',         // Warning plasma
          purple: '#8B5CF6',        // AIOps quantum violet
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'spatial-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.7)',
        'glow-cyan': '0 0 30px -5px rgba(6, 182, 212, 0.35)',
        'glow-crimson': '0 0 35px -5px rgba(244, 63, 94, 0.45)',
        'glow-emerald': '0 0 30px -5px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
