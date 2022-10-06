/// <reference types="vitest" />
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [ ...configDefaults.exclude, './test/**.test.ts' ]
  },
})
