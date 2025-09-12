export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      // Core rules - relaxed for development
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-unused-vars': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      
      // Code quality rules
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-args': 'error',
      'no-constant-condition': 'warn',
      'no-empty': 'warn',
      'no-extra-semi': 'error',
      
      // Minimal formatting rules
      'semi': ['warn', 'never'],
      'quotes': ['warn', 'single', { avoidEscape: true }],
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.next/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
      'scripts/**',
      'public/**',
      '.console-log-backups/**',
      'vite.config.ts',
      'tailwind.config.js',
      'postcss.config.js',
    ],
  },
]
