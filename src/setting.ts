// 监听埋点事件方法名称
export const LISTENING_EVENT = 'listeningEvent';

// 埋点属性标识
export const POINT_PROP = 'data-point';

// 分割埋点属性事件名称标识
export const SPLIT_IDENT = ':';

// 替换目标方法名称正则
export const replaceReg = (content: string) => new RegExp(`${content}\\((.*?)\\{`);

// -----------------------------------------
// 静态资源
export const VITE_STATIC_RESOURCE = 'vite-static';
// 静态资源标识
export const VITE_STATIC_RESOURCE_PATH = `:${VITE_STATIC_RESOURCE}`;
// 本地插件存放静态资源路径
export const VITE_STATIC_PATH = './src/static';
// 目标资源存放路径
export const VITE_TARGET_STATIC_PATH = `./${VITE_STATIC_RESOURCE}`;

// -----------------------------------------
// 数据库名称
export const DATABASE_NAME = 'monitor-database';
// 埋点列表存储对象名称
export const STORE_POINT_NAME = 'monitor-log';
// 本地存储变化对象名称 及 前缀
export const LOCAL = '_local_store-log';
export const SESSION = '_session_store-log';

export const STORE_LIST = [STORE_POINT_NAME, LOCAL, SESSION];

// -----------------------------------------
// 内存数据变动 tag标识
export const STORE_CHANGE_IDENT_OUT = '--';
export const STORE_CHANGE_IDENT_IN = '%%';
