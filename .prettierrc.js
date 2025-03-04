module.exports = {
  // Line length
  printWidth: 100,

  // Indentation
  tabWidth: 2,
  useTabs: false,

  // Quotes and semicolons
  singleQuote: true,
  jsxSingleQuote: false,
  semi: true,

  // Object formatting
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,

  // JSX/TSX formatting
  jsxBracketSameLine: false,
  arrowParens: 'avoid',

  // File formatting
  endOfLine: 'lf',

  // Import ordering
  importOrder: [
    '^react$',
    '^@/(.*)$',
    '^[./]'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,

  // Override specific file patterns
  overrides: [
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
      },
    },
    {
      files: '*.{css,scss}',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.json',
      options: {
        parser: 'json',
      },
    },
  ],
};
