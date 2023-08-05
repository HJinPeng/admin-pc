import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv, ProxyOptions } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueCssModule from 'vite-plugin-vue-css-module'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  console.log('env', mode, env.BASE_URL)
  return {
    base: '/' + env.VITE_APP_CODE,
    plugins: [vue(), vueJsx(), vueCssModule()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@http': fileURLToPath(new URL('./src/utils/http', import.meta.url))
      }
    },
    server: {
      proxy: generateProxy(env.VITE_APP_PROXY, env.VITE_APP_CODE)
    }
  }
})

// 生成proxy
function generateProxy(proxyStr: string, appCode: string) {
  const proxy = JSON.parse(proxyStr)
  const result: Record<string, string | ProxyOptions> = {}
  for (const k in proxy) {
    const prefix = `/${appCode}/${k}`.replace(/\/{2,}/g, '/')
    result['^' + prefix] = {
      target: proxy[k],
      changeOrigin: true,
      rewrite: (path: string) => {
        console.log('path', path)
        return path.replace(new RegExp('^' + prefix), '')
      }
    }
  }
  return result
}
