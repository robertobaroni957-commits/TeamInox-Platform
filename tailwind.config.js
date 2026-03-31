/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        inox: {
          dark: '#0d0f11',   // Sfondo principale
          card: '#1a1d20',   // Sfondo card/sidebar
          orange: '#fc6719', // Arancio ufficiale Inox
          blue: '#048ea0',   // Blu accento
          cyan: '#00f0ff',   // Cyan per dettagli "neon"
          text: '#f0f0f0',
          gray: '#888888',
        },
        // Mantengo questi per compatibilità con dati Zwift
        'zwift-orange': '#ff5a00',
        'zwift-dark': '#1e1e24',
      },
      fontFamily: {
        'display': ['Teko', 'sans-serif'], // Per titoli e numeri (Racing look)
        'body': ['Inter', 'system-ui', 'sans-serif'], // Per testi leggibili
      }
    },
  },
  plugins: [],
}