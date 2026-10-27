import nextPlugin from '@next/eslint-plugin-next'
import tseslint from 'typescript-eslint'

const eslintConfig = [
  {
    ignores: [
      '.next/**/*',
      'out/**/*',
      'build/**/*',
      'next-env.d.ts',
      'node_modules/**/*'
    ]
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      '@next/next': nextPlugin,
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...tseslint.configs.recommended.rules
    }
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'react-hooks/exhaustive-deps': 'off'
    }
  }
]

export default eslintConfig
