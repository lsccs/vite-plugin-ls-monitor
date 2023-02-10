import { Plugin, TransformResult } from 'vite';
import { scheduler } from './src/scheduler';
import fs from 'fs'

export function CreateDevToolPlugin(): Plugin {
  fs.readFile('./src/js/index.ts', (err, data) => {
    console.log(data, err, 'data');
  });

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
              defer: true,
              type: 'module',
            },
            children: 'console.log()',
          },
          // tag: string;
          // attrs?: Record<string, string | boolean | undefined>;
          // children?: string | HtmlTagDescriptor[];
          // /**
          //  * default: 'head-prepend'
          //  */
          // injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend';
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
