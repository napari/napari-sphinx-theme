const config = require('eslint-config-airbnb-base/rules/style');

module.exports = {
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'no-console': 'off',
    'no-param-reassign': 'off',

    'import/extensions': 'off',

    // Named exports are nicer to work with for a variety of reasons:
    // https://basarat.gitbook.io/typescript/main-1/defaultisbad
    'import/no-default-export': 'error',
    'import/prefer-default-export': 'off',

    // Let ESlint sort our imports for us so we don't have to think about it.
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'error',

    'no-underscore-dangle': 'off',

    // Allow for-of loops since most browsers support it now.
    'no-restricted-syntax': config.rules['no-restricted-syntax'].filter(
      (rule) => rule.selector !== 'ForOfStatement',
    ),
  },
};
