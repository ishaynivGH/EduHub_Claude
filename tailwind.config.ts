import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          red: '#FF6B6B',
          blue: '#5DADE2',
          green: '#52C78A',
          orange: '#F8B195',
          lightRed: '#FFB3B3',
          lightBlue: '#AED6F1',
          lightGreen: '#A8E6C1',
          lightOrange: '#FFE5CC',
        },
      },
      fontFamily: {
        quicksand: ['Quicksand', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
