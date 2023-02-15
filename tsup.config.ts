import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts', 'src/script/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  clean: true,
});
