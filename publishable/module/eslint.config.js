import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
      },
    },
  },

  ...vueI18n.configs.recommended,

  {
    rules: {
      // optional
      '@intlify/vue-i18n/no-dynamic-keys': 'error',
      '@intlify/vue-i18n/no-unused-keys': [
        'error',
        {
          extensions: ['.js', '.vue']
        }
      ]
    },
    settings: {
      'vue-i18n': {
        localeDir: './src/locales/*.{json,json5,yaml,yml}', // extension is glob formatting!
        // or
        // localeDir: {
        //   pattern: './path/to/locales/*.{json,json5,yaml,yml}', // extension is glob formatting!
        //   localeKey: 'file' // or 'path' or 'key'
        // }
        // or
        // localeDir: [
        //   {
        //     // 'file' case
        //     pattern: './path/to/locales1/*.{json,json5,yaml,yml}',
        //     localeKey: 'file'
        //   },
        //   {
        //     // 'path' case
        //     pattern: './path/to/locales2/*.{json,json5,yaml,yml}',
        //     localePattern: /^.*\/(?<locale>[A-Za-z0-9-_]+)\/.*\.(json5?|ya?ml)$/,
        //     localeKey: 'path'
        //   },
        //   {
        //     // 'key' case
        //     pattern: './path/to/locales3/*.{json,json5,yaml,yml}',
        //     localeKey: 'key'
        //   },
        // ]

        // Specify the version of `vue-i18n` you are using.
        // If not specified, the message will be parsed twice.
        messageSyntaxVersion: '^11.0.0'
      }
    }
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,
])
