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
        nms: {
          background: '#F8F9FA',    // Warm light-gray workspace
          surface: '#FFFFFF',       // White content surfaces
          text: '#1E293B',          // Deep graphite text
          textMuted: '#64748B',     // Muted text
          border: '#E2E8F0',        // Muted neutral borders
          primary: '#4F46E5',       // Restrained indigo interaction
          primaryHover: '#4338CA',  // Indigo hover
          healthy: '#16A34A',       // Green for healthy
          warning: '#D97706',       // Amber for warnings
          critical: '#DC2626',      // Red for critical
          info: '#0284C7',          // Blue for info
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
