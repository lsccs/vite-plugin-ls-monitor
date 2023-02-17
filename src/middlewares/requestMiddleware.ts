import type { Connect } from 'vite';
import { ResourceMiddleware } from './resourceMiddleware';
import { VITE_STATIC_RESOURCE_PATH } from '../setting';

/**
 * 请求中间件，处理静态资源
 */
export default ((req, res, next) => {
  if (req.url?.endsWith(VITE_STATIC_RESOURCE_PATH)) {
    const [resource] = req.url.split(VITE_STATIC_RESOURCE_PATH);
    ResourceMiddleware(resource, res);
    return;
  }
  next();
}) as Connect.NextHandleFunction;
