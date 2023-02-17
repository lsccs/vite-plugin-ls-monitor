import * as http from 'node:http';
import { readFile } from 'fs-extra';
import { VITE_TARGET_STATIC_PATH } from '../setting';
import { getMIME } from '../utils';

/**
 * 处理静态资源
 */
export function ResourceMiddleware(url: string, res: http.ServerResponse) {
  readFile(VITE_TARGET_STATIC_PATH + url, (_, data) => {
    const [, fileType] = url.split('.');
    const type = getMIME(fileType);
    if (type) {
      res.setHeader('content-type', type);
    }
    res.end(data.toString());
  });
}
