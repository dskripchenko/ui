import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
      entryRoot: resolve(__dirname, 'src'),
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'icons/index': resolve(__dirname, 'src/icons/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryAlias) =>
        `${entryAlias}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', 'lucide-vue-next'],
      output: {
        assetFileNames: 'styles/[name][extname]',
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
    globals: true,
  },
})
