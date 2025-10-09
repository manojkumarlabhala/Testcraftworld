import postcssImport from 'postcss-import';

const config = {
  plugins: {
    'postcss-import': postcssImport(),
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
