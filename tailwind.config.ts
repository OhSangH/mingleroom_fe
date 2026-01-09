import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 60px -30px rgba(15, 23, 42, 0.6)',
      },
    },
  },
  plugins: [],
};

export default config;
