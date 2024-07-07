import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        'h1': {
          'font-size': '3.5rem',
          'font-weight': '900',
          'text-transform': 'uppercase',
          'letter-spacing': '-0.05rem',
        },
        'h2': {
          'font-size': '3rem',
          'font-weight': '700',
          'text-transform': 'uppercase',
          'letter-spacing': '-0.05rem',
        }
      })
    })
  ],
}

