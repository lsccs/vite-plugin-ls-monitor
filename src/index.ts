import { Plugin, TransformResult } from 'vite';
import { readFileSync, ensureFile, writeFile } from 'fs-extra';
import pkg from '../package.json';

import { scheduler } from './scheduler';
import { readDirAndFile, resolve } from './utils';
import requestMiddleware from './middlewares/requestMiddleware';
import { VITE_STATIC_PATH, VITE_TARGET_STATIC_PATH } from './setting';
import { script } from './api';

export function createLsMonitorPlugin(): Plugin {
  return {
    name: pkg.name,
    enforce: 'pre',

    configureServer(server) {
      initStaticResources();
      server.middlewares.use(requestMiddleware);
    },

    transformIndexHtml(html) {
      return {
        html,
        tags: initScript(),
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

// 初始化静态资源
function initStaticResources() {
  readDirAndFile(resolve(VITE_STATIC_PATH), async (path: string, fullPath: string) => {
    try {
      const [, dir] = fullPath.split('static');
      const file = await readFileSync(fullPath);
      const targetPath = VITE_TARGET_STATIC_PATH + dir;
      await ensureFile(targetPath);
      writeFile(targetPath, file.toString());
    } catch (e) {
      console.error('vite-plugin: static resource load error!');
    }
  });
}

// 创建初始化执行脚本
function initScript() {
  return [
    {
      tag: 'script',
      attrs: {
        type: 'module',
        src: script,
      },
    },
  ];
}
