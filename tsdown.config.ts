import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli/index.ts'
  },
  outDir: 'dist',
  format: ['esm'],
  dts: true,
  // sourcemap: true,
  clean: true,
  exports: true,
  platform: 'node',
  minify: false,
  external: ['fastify', '@fastify/cors', '@fastify/static', 'commander', 'chokidar', 'lodash.merge', 'path-to-regexp']
})