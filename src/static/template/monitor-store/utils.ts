// 获取对象标识
import { arrayChar, DivAttr, objChar, ObjectTypeMap } from './types';
import { isArray, isObject } from '../../../utils';
import { outTagStr } from '../../action/memory';
import { objectArrayMap } from '../../../enum/cssClass';

export function getObjectChar(data: object | string | null): ObjectTypeMap | undefined {
  if (!data) {
    return undefined;
  }
  const map: ObjectTypeMap[] = [
    { method: isObject, start: objChar.start, end: objChar.end },
    { method: isArray, start: arrayChar.start, end: arrayChar.end },
  ];
  return map.find((item) => item.method(data));
}

// 替换对象或数组缩略图
export function getObjectAndArrayMap(objectChar: ObjectTypeMap, isArray: boolean, len: number) {
  const pre = isArray ? `(${len})` : '';
  return getDiv({
    children: pre + objectChar.start + '...' + objectChar.end,
    className: objectArrayMap,
    tag: 'span',
  });
}

// 生成冒号
export function getColon() {
  return getDiv({ children: ': ', tag: 'span' });
}

// 生成基本标签
export function getDiv({ children, className, tag = 'div', attrs = {} }: DivAttr) {
  const attrStr = Object.keys(attrs).reduce((pre, cur) => {
    return pre + `${cur}="${attrs[cur]}" `;
  }, '');
  return `<${tag} class="${className || ''}" ${attrStr}>${children || ''}</${tag}>`;
}

// 替换内存标识
export function splitStoreTag(value: string, tagStr = outTagStr) {
  if (!value) return [];
  return value.split(tagStr);
}
