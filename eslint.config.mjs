import eslintPluginVue from 'eslint-plugin-vue'
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
    },
    rules: {
      ...eslintPluginVue.configs['vue3-recommended'].rules,
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
    },
  },
]
