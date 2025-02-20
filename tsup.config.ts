import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outExtension({ format }) {
    if (format === 'cjs') {
      return { js: '.js' }
    }
    return {}
  },
})
