import { Plugin, TransformResult } from 'vite';
import { scheduler } from './scheduler';
import { readFileSync } from 'fs';
import { resolve } from './utils';

export function CreateDevToolPlugin(): Plugin {
  const file = readFileSync(resolve('src/script/index.js'));

  return {
    name: 'vite-plugin-dev-tool',
    enforce: 'pre',

    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              type: 'module',
            },
            children: file.toString(),
          },
        ],
      };
    },
    transform(code: string, id: string): Promise<TransformResult> | TransformResult {
      return new Promise<TransformResult>((resolve) => {
        scheduler({
          id,
          code,
          transform(result: TransformResult) {
            resolve(result);
          },
        });
      });
    },
  } as Plugin;
}
