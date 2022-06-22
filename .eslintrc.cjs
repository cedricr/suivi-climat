module.exports = {
  root: true,
  extends: ["eslint:recommended", "prettier"],
  plugins: ["svelte3"],
  overrides: [{ files: ["*.svelte"], processor: "svelte3/svelte3" }],
  globals: {
    Plotly: "readonly",
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  rules: {
    eqeqeq: ["error", "smart"],
    "func-style": [
      "error",
      "declaration",
      {
        allowArrowFunctions: true,
      },
    ],
    "jsdoc/require-jsdoc": "off",
    "no-alert": "warn",
    "no-console": "warn",
    "no-return-assign": "error",
    "no-undef-init": "off",
    "no-undefined": "off",
    "no-underscore-dangle": "off",
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "no-warning-comments": [
      "warn",
      {
        location: "start",
        terms: ["todo", "hack", "xxx", "fixme"],
      },
    ],
    "node/no-missing-import": "off",
    "node/no-unpublished-import": "off",
    "node/no-unpublished-require": "off",
    "padding-line-between-statements": "off",
  },
  settings: {
    "svelte3/ignore-styles": () => true,
  },
};
