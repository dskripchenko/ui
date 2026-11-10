import { readFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { visualizer } from 'rollup-plugin-visualizer'

const analyze = process.env.ANALYZE === 'true'

const lucideLicense = readFileSync(resolve(__dirname, 'node_modules/lucide-vue-next/LICENSE'), 'utf8').trim()
const lucideBanner = `/*! Includes icons from lucide-vue-next (https://lucide.dev)\n${lucideLicense.replace(/\*\//g, '* /')}\n*/`

const unicodeLicense = readFileSync(resolve(__dirname, 'src/components/EmojiPicker/data/LICENSE-UNICODE.txt'), 'utf8').trim()
const unicodeBanner = `/*! Emoji data from Unicode emoji-test.txt and CLDR annotations (https://unicode.org)\n${unicodeLicense.replace(/\*\//g, '* /')}\n*/`

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
        id === 'vue' || id === '@dskripchenko/syntax' || id === '@dskripchenko/math' || (id === 'lucide-vue-next' && !!importer?.replace(/\\/g, '/').endsWith('/src/icons/index.ts')),
      output: {
        assetFileNames: 'styles/[name][extname]',
        postBanner: (chunk) => {
          if (chunk.isEntry && chunk.name === 'index') return lucideBanner
          return chunk.moduleIds.some((id) => id.replace(/\\/g, '/').includes('/EmojiPicker/data/')) ? unicodeBanner : ''
        },
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
