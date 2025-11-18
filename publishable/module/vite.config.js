import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// import { viteMockServe } from 'vite-plugin-mock'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base: env.VITE_BASE,

    plugins: [
      vue(),
      vueDevTools(),
      /*
      viteMockServe({
        enable: false, // env.VITE_MOCK === 'true',
        //
        // localEnabled: true, // enable in dev
        // prodEnabled: false, // disable in prod
        //
        mockPath: 'mock', // mock folder path
        logger: true // show logs
      }),
      */
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },

    server: {
      proxy: {
        '^/api': {
          target: env.VITE_PROXY,
          changeOrigin: true,
          secure: false,
          auth: env.VITE_AUTH,
          headers: {
            Cookie: env.VITE_COOKIE,
          },
        },
      },
    },

    optimizeDeps: {
      include: [
        'datatables.net',
        'datatables.net-dt',
        'datatables.net-bs5'
      ]
    },

    // bootstrap
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: [
            'import',
            'mixed-decls',
            'color-functions',
            'global-builtin',
          ],
        },
      },
    },
  }
})
