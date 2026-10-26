import { readFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { visualizer } from 'rollup-plugin-visualizer'

const analyze = process.env.ANALYZE === 'true'

const lucideLicense = readFileSync(resolve(__dirname, 'node_modules/lucide-vue-next/LICENSE'), 'utf8').trim()
const lucideBanner = `/*! Includes icons from lucide-vue-next (https://lucide.dev)\n${lucideLicense.replace(/\*\//g, '* /')}\n*/`

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
      entryRoot: resolve(__dirname, 'src'),
    }),
    analyze && visualizer({
      filename: 'stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'icons/index': resolve(__dirname, 'src/icons/index.ts'),
        'hls/index': resolve(__dirname, 'src/hls/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryAlias) =>
        `${entryAlias}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: (id, importer) =>
        id === 'vue' || (id === 'lucide-vue-next' && !!importer?.replace(/\\/g, '/').endsWith('/src/icons/index.ts')),
      output: {
        assetFileNames: 'styles/[name][extname]',
        postBanner: (chunk) => (chunk.isEntry && chunk.name === 'index' ? lucideBanner : ''),
        globals: { vue: 'Vue' },
      },
    },
    cssCodeSplit: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
})
