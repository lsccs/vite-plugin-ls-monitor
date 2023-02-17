import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'index.ts',
    'src/static/action/index.ts',
    'src/static/styles/index.css',
    'src/static/template/**',
  ],
  format: ['esm'],
  dts: {
    entry: './index.ts',
  },
  splitting: false,
  clean: true,
  treeshake: true,
  loader: {
    '.html': 'copy',
  },
});
