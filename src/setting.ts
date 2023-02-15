// 监听埋点事件方法名称
export const LISTENING_EVENT = 'listeningEvent';

// 埋点属性标识
export const POINT_PROP = 'data-point';

// 分割埋点属性事件名称标识
export const SPLIT_IDENT = ':';

// 替换目标方法名称正则
export const replaceReg = (content: string) => new RegExp(`${content}\\((.*?)\\{`);
