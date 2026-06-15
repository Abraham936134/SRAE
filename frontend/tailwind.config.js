/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',     // azul universitario
        secondary: '#0F172A',   // casi negro
        accent: '#10B981',      // verde esmeralda
        peligro: '#EF4444',     // rojo
        danger: '#EF4444',
        advertencia: '#F59E0B', // ámbar
        warning: '#F59E0B',
        bgLight: '#F8FAFC',     // gris muy claro
        surface: '#FFFFFF',     // cards y paneles
        borderLight: '#E2E8F0', // divisores sutiles
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',  // inputs
        md: '6px',  // botones
        lg: '8px',  // cards
      }
    },
  },
  plugins: [],
}
