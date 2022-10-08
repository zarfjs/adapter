import { defineConfig } from 'tsup'
import { builtinModules } from "module";

export default defineConfig({
    entry: {
      index: 'src/index.ts',
      static: 'src/static.ts'
    },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    treeshake: true,
    external: [ ...builtinModules, "__STATIC_CONTENT_MANIFEST" ]
})
