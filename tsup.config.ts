import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'memory.ts',
    'src/static/action/memory.ts',
    'src/static/styles/index.css',
    'src/static/template/*',
  ],
  format: ['esm'],
  dts: {
    entry: './memory.ts',
  },
  splitting: false,
  clean: true,
  treeshake: true,
  loader: {
    '.html': 'copy',
  },
});
