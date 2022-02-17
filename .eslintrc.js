/**
 * ESLint configuration for napari hub client. All client code is linted using
 * this configuration. That includes JS tooling modules, configuration scripts
 * (next.config.js, plopfile.js, etc.), E2E tests, and application source code.
 *
 * Files with specific configurations are handled using the ESLint `overrides`
 * feature. We use overrides over nested `.eslintrc.js` files (for example
 * `src/.eslintrc.js` and `src/pages/.eslintrc.js`) to make this configuration
 * file the Single Source of Truth for ESLint configuration.
 */

const configs = {
  dev: require.resolve('./eslint/dev'),
  e2e: require.resolve('./eslint/e2e'),
  react: require.resolve('./eslint/react'),
  tests: require.resolve('./eslint/tests'),
  typescript: require.resolve('./eslint/typescript'),
};

const getPattern = (pattern) => `./src/napari_sphinx_theme/assets/${pattern}`;

module.exports = {
  root: true,
  extends: ['airbnb/base', 'prettier', configs.dev],
  plugins: ['simple-import-sort'],

  overrides: [
    // TypeScript and React source code.
    {
      files: [getPattern('**/*.ts{,x}')],
      extends: [configs.typescript, configs.react],
    },

    {
      files: ['scripts/**/*.mjs'],
      extends: [configs.dev],
    },

    /*
      Disable explicit return types for TSX files. Prefer inferred return
      types for React components, hooks, and tests:
      https://kentcdodds.com/blog/how-to-write-a-react-component-in-typescript
    */
    {
      files: [
        getPattern('**/*.tsx'),
        getPattern('**/*.hooks.ts'),
        getPattern('hooks/*.ts'),
        getPattern('**/hooks.ts'),
        getPattern('**/*.test.ts{,x}'),
      ],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ],
};
