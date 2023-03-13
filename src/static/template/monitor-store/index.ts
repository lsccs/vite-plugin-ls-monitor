// 创建内存记录标签
import { LOCAL } from '../../../setting';
import { getDB } from '../../action/database';
import { returnEventTag, returnStatusTag, getNextIndex } from '../../action/memory';
import { getID, isArray, isObjectOrArray, setObjectAttrVisible } from '../../../utils';

import type { ObjectTypeMap, StorageRootNode } from './types';
import { EventValue, objChar } from './types';

import { getColon, getDiv, getObjectAndArrayMap, getObjectChar, splitStoreTag } from './utils';
import {
  attrClassName,
  dataId,
  hide,
  objectContainer,
  objectArrayMap,
  objectIndentContent,
  objectKeyValueClass,
  objectMapIdent,
  objectStatusBlock,
} from '../../../enum/cssClass';

export function createStoreChangeHtml(root: Element) {
  const className = '.ls-monitor-store-local-content';
  getLocalAllData(LOCAL).then((data) => {
    console.log(data, 'data');
    let result = generateHtml(data);

    const local = root.querySelector(className);
    if (local) {
      result =
        getDiv({ children: objChar.start }) +
        getDiv({ children: result, className: objectIndentContent });
      result += getDiv({ children: objChar.end });
      local.innerHTML = result;
      storeObjectEvent(root);
    }
  });
}

// 处理内存对象属性缩略点击
function storeObjectEvent(root: Element) {
  const objectMaps = root?.querySelectorAll(`.${objectContainer}`);

  objectMaps?.forEach((item) => {
    item.addEventListener('click', () => {
      const id = item.getAttribute(dataId);
      const target = document.querySelector(`.${objectIndentContent}[${dataId}="${id}"]`);
      const map = item.querySelector(`.${objectArrayMap}`);
      const mapIdent = item.querySelector(`.${objectMapIdent}`);

      setObjectAttrVisible(map);
      setObjectAttrVisible(mapIdent);
      setObjectAttrVisible(target);
    });
  });
}

// 获取 localStorage sessionStorage
async function getLocalAllData(storage: string) {
  const data: StorageRootNode = {};
  const db = await getDB(storage);
  const keys = await db.getDBAllKeys();
  const tag = getNextIndex();
  for (const k of keys) {
    const valueObj = await db.getItem(k);
    data[k.toString()] = {
      value: generateStoreData(valueObj, tag),
      tagStr: returnStatusTag(tag),
      eventStr: returnEventTag(tag),
      route: [],
    };
  }
  return data;
}

// 重新生成内存数据结构
function generateStoreData(valueObj: object, tagIndex: number): StorageRootNode {
  return Object.keys(valueObj).reduce((pre, cur) => {
    const tagStr = returnStatusTag(tagIndex);
    const changeLog = splitStoreTag(valueObj[cur], tagStr);
    let storageRootNode: StorageRootNode | string = changeLog[changeLog.length - 1];
    try {
      const event = returnEventTag(tagIndex);
      const { value } = getEventValueTag(storageRootNode, event);
      const data = JSON.parse(value);
      if (isObjectOrArray(data)) {
        storageRootNode = generateStoreData(data, getNextIndex(tagIndex));
      }
    } catch (e) {
    } finally {
      pre[cur] = {
        value: storageRootNode,
        route: changeLog,
        tagStr,
        eventStr: returnEventTag(tagIndex),
      };
    }
    return pre;
  }, (isArray(valueObj) ? [] : {}) as StorageRootNode);
}

// 循环遍历json生成节点
function generateHtml(data: StorageRootNode) {
  let result = '';
  for (const key in data as object) {
    const { value, route, eventStr } = data[key];
    const objectChar = getObjectChar(value);
    // 兼容第一次循环
    if (objectChar) {
      let tag = '';
      const v = value as unknown as StorageRootNode;
      // 获取对象key的tag状态
      if (route.length) {
        const lastLog = route[route.length - 1];
        const eventValue = getEventValueTag(lastLog, eventStr);
        tag = eventValue.tag;
      }

      result += generateObject(v, key, objectChar, tag);
      continue;
    }
    // 获取对象属性的tag状态
    const { value: v, tag } = getEventValueTag(value as string, eventStr);
    result += getObjectAttrDiv(key, v, tag);
  }
  return result;
}

// 生成对象节点
function generateObject(
  value: StorageRootNode,
  key: string,
  objectChar: ObjectTypeMap,
  tag: string,
) {
  let result = '';
  const objectAttrs = generateHtml(value);
  const { attrs, container } = getObjectAttrMap(value, key, objectChar, tag);

  // 对象内容，默认隐藏
  const objectContent = getDiv({
    children: objectAttrs,
    className: `${objectIndentContent} ${hide}`,
    attrs,
  });
  result += getDiv({ children: container + objectContent });

  return result;
}

// 对象key + 缩略标识
function getObjectAttrMap(
  value: StorageRootNode,
  key: string,
  objectChar: ObjectTypeMap,
  tag: string,
) {
  const objKey = key ? key + getColon() : '';
  const htmlAttrs = { [dataId]: getID() };
  // 对象缩略展开占位标识
  const mapIdent = getDiv({
    children: isArray(value) ? `Array(${value.length})` : '',
    className: `${objectMapIdent} ${hide}`,
    tag: 'span',
  });
  // 对象key + 缩略标识
  const objContainer = getDiv({
    children:
      objKey +
      getObjectAndArrayMap(objectChar, isArray(value), value.length as unknown as number) +
      mapIdent,
    className: `${objectContainer} ${objectStatusBlock} ${tag}`,
    attrs: htmlAttrs,
  });
  return {
    attrs: htmlAttrs,
    container: objContainer,
  };
}

// 生成对象属性key-value
function getObjectAttrDiv(key: string, value: string, tag: string) {
  const k = getDiv({ children: key, className: attrClassName, tag: 'span' });
  // 根据类型返回对应得样式
  const v = getDiv({ children: value, tag: 'span' });
  const content = getDiv({
    children: k + getColon() + v,
    className: `${objectKeyValueClass} ${objectStatusBlock} ${tag}`,
  });
  // 额外套一层 div，防止内容因为 inline-block 平铺在一行
  return getDiv({ children: content });
}

// 获取 tag
function getEventValueTag(value: string, eventStr: string): EventValue {
  const [v, ...tags] = value.split(eventStr);
  return {
    value: v,
    tag: tags[tags.length - 1],
    tags,
  };
}
