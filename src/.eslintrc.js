module.exports = {
  env: {
    es2021: true,
    node: true,
    commonjs: true,
  },
  parser: '@babel/eslint-parser',
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'script',
    requireConfigFile: false,
  },
  rules: {},
};
