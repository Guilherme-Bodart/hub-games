/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        textPrimary: '#2B2A46',
        gameCyan: '#28C2E0',
        gamePink: '#F377B6',
        coralAction: '#FF7D67',
        catalog: {
          milk: '#FFFFFF',
          ink: '#2B2A46',
          purple: '#7F72E8',
          cyan: '#28C2E0',
          pink: '#F377B6',
          blue: '#5BAFEF',
          orange: '#F8A409',
          actionBlue: '#227DDB',
        },
      },
      fontFamily: {
        display: ['Baloo2_700Bold'],
        body: ['Nunito_700Bold'],
        number: ['Nunito_800ExtraBold'],
      },
      borderRadius: {
        'catalog-card': '18px',
        'catalog-tile': '14px',
      },
      boxShadow: {
        tactile: '0px 2px 4px rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
};
