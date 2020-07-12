module.exports = {
  root: true,
  env: {
    node: true,
  },
  plugins: [
    'graphql',
  ],
  'extends': [
    'plugin:vue/essential',
    '@vue/standard',
    '@ej/eslint-config',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'graphql/template-strings': [
      'error',
      {
        env: 'literal',
        projectName: 'app',
      },
    ],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
