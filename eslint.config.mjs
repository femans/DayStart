// @ts-check

// Your custom configs here
import eslintPluginVue from 'eslint-plugin-vue'
import eslintPluginTailwindCSS from 'eslint-plugin-tailwindcss'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

const nuxtConfig = await withNuxt()

export default [
  ...nuxtConfig,
  {
    ignores: ['node_modules', 'dist'], // Directories to ignore
  },
  {
    files: ['**/*.js', '**/*.ts', '**/*.vue'], // Target file types
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020, // Modern JavaScript features
        sourceType: 'module',
      },
    },
    plugins: {
      vue: eslintPluginVue,
      tailwindcss: eslintPluginTailwindCSS,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintPluginVue.configs['vue3-recommended'].rules,
      ...eslintPluginTailwindCSS.configs.recommended.rules,
      'tailwindcss/classnames-order': 'warn', // Warn about unordered classes
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: { max: 3 },
          multiline: { max: 1 },
        },
      ],
      'vue/first-attribute-linebreak': [
        'error',
        {
          singleline: 'ignore',
          multiline: 'below',
        },
      ],
      'vue/html-indent': [
        'error',
        2,
        {
          attribute: 1,
          closeBracket: 0,
          alignAttributesVertically: true,
          ignores: [],
        },
      ],
      'vue/html-closing-bracket-newline': [
        'error',
        {
          singleline: 'never',
          multiline: 'always',
        },
      ],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          semi: false,
        },
      ],
    },
    settings: {
      tailwindcss: {
        callees: ['classnames', 'clsx'], // Include class helper libraries if used
        config: './tailwind.config.js', // Tailwind config path
      },
    },
  },
]
