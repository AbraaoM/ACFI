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
        // Cores personalizadas ACFI
        'acfi-primary': '#0C1E3F',      // Base Sólida - Azul marinho profundo
        'acfi-secondary': '#2A6FFF',    // Destaque - Azul vibrante
        'acfi-neutral': '#F0F4F8',      // Conteúdo - Branco suave
        'acfi-text-light': '#FFFFFF',   // Texto claro
        'acfi-text-dark': '#607C9B',    // Texto auxiliar
        'acfi-success': '#00C853',      // Sucesso/Dados positivos
        'acfi-alert': '#FF3D00',        // Alerta/Erro
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        'acfi-theme': {
          'primary': '#2A6FFF',         // Secundária como primary do DaisyUI
          'primary-content': '#FFFFFF', // Texto sobre primary
          'secondary': '#0C1E3F',       // Primária como secondary do DaisyUI
          'secondary-content': '#FFFFFF',
          'accent': '#00C853',          // Success como accent
          'accent-content': '#FFFFFF',
          'neutral': '#607C9B',         // Texto auxiliar como neutral
          'neutral-content': '#FFFFFF',
          'base-100': '#F0F4F8',        // Neutro como base principal
          'base-200': '#E2E8F0',        // Variação mais escura do neutro
          'base-300': '#CBD5E0',        // Ainda mais escura
          'base-content': '#607C9B',    // Texto sobre base
          'info': '#2A6FFF',
          'info-content': '#FFFFFF',
          'success': '#00C853',
          'success-content': '#FFFFFF',
          'warning': '#FFA726',
          'warning-content': '#FFFFFF',
          'error': '#FF3D00',
          'error-content': '#FFFFFF',
          
          // Variáveis CSS personalizadas
          '--rounded-box': '0.5rem',
          '--rounded-btn': '0.375rem',
          '--rounded-badge': '1.9rem',
          '--animation-btn': '0.25s',
          '--animation-input': '0.2s',
          '--btn-focus-scale': '0.95',
          '--border-btn': '1px',
          '--tab-border': '1px',
          '--tab-radius': '0.5rem',
        },
      },
    ],
    darkTheme: 'acfi-theme',
  },
}