/**
 *  本地存储监听初始化
 */
import { LOCAL, SESSION, STORE_CHANGE_IDENT, STORE_EVENT_IDENT } from '../setting';
import { DB, getDB } from './database';
import { STORE_CHANGE_TAG } from '../types';
import {
  isEquals,
  copy,
  isObjectOrArray,
  isArray,
  getObjectType,
  jsonObject,
} from '../utils';

// 缓存上一次的值
const cache = {
  [SESSION]: {},
  [LOCAL]: {},
};
// storage 映射
const storage = {
  [SESSION]: sessionStorage,
  [LOCAL]: localStorage,
};
export const getNextIndex = (i = 0) => ++i;

const channel = new MessageChannel();

listeningMemory();
export function listeningMemory() {
  const createStorage = (storageName: string) => ({
    setItem: local(storageName),
    ...copy(storage[storageName], ['setItem']),
  });
  const localValue = createStorage(LOCAL);
  const sessionValue = createStorage(SESSION);

  Object.defineProperty(window, 'localStorage', {
    value: localValue,
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionValue,
  });
}

/**
 * 覆盖 setItem
 */
function local(storageName: string) {
  const store = storage[storageName];
  return (key: string, value: string) => {
    const cacheStore = cache[storageName];
    cacheStore[key] = JSON.parse(store.getItem(key));
    store.setItem(key, value);
    channel.port1.onmessage = () => recordChangeLog(storageName, key, value);
    channel.port2.postMessage('');
  };
}

/**
 * 新建数据表，记录变更日志
 */
async function recordChangeLog(storeName: string, key: string, value: string) {
  const db = await getDB(storeName);
  if (!db) {
    console.error('indexedDB connect error');
    return Promise.reject();
  }
  for (let i = 0; i < 90000000000000000000000; i++) {
    console.log('okkkkk')
  }
  await diffChangeRecordLog(storeName, key, value, db);
  return Promise.resolve();
}

/**
 * 对比两次修改结果，添加记录
 */
async function diffChangeRecordLog(storeName: string, key: string, value: string, db: DB) {
  const preValue = await db.getItem(key);
  const currenValue = JSON.parse(value);
  // 对比缓存和修改的值是否一致
  const storeValue = cache[storeName][key];
  if (!isEquals(storeValue, currenValue)) {
    const value = diffChangeRecordLogHost(preValue, currenValue, getNextIndex(), storeValue);
    db.put(value, key);
  }
}

/**
 * 记录每个属性的变化, 并打上 tag
 * 例: ||ls:add, 内层对象使用 @@
 */
function diffChangeRecordLogHost(
  preValue: string,
  currenValue: any,
  tagIndent: number,
  cacheValue?: any,
) {
  // 当前值不是对象，或者 缓存的值为空，则无需对比
  if (!isObjectOrArray(currenValue) || !cacheValue) {
    const tag = cacheValue ? STORE_CHANGE_TAG.UPDATE : STORE_CHANGE_TAG.ADD;
    return returnRecordTag(preValue, currenValue, tag, tagIndent);
  }

  if (getObjectType(currenValue) !== getObjectType(cacheValue)) {
    return returnRecordTag(preValue, currenValue, STORE_CHANGE_TAG.UPDATE, tagIndent);
  }

  // 初始化
  const nextTagIndent = getNextIndex(tagIndent);
  const deleteKeys = { ...cacheValue };

  for (const key in currenValue) {
    const cur = currenValue[key];
    const pre = cacheValue[key];

    currenValue[key] = diffChangeRecordLogHost('', cur, nextTagIndent, pre);
    Reflect.deleteProperty(deleteKeys, key);
  }
  // 查看剩余未匹配的 preKeys，标记删除
  Object.keys(deleteKeys).forEach((k) => {
    currenValue[k] = returnRecordTag(currenValue[k], '', STORE_CHANGE_TAG.DELETE, nextTagIndent);
  });
  // 合并
  return mergeStoreValue(preValue, currenValue, tagIndent);
}

// 截取最新得值，覆盖修改
function mergeStoreValue(preValue: string, data: any, tagIndent: number) {
  // 当 preValue 为空时，不需要合并
  if (!preValue) {
    return data;
  }
  const tagStr = returnStatusTag(tagIndent);
  const event = returnEventTag(tagIndent);
  const nextIndex = getNextIndex(tagIndent);

  const dataObject = jsonObject(data);
  // 截取最新的值
  const tagValue = preValue.split(tagStr);
  const lastTag = tagValue[tagValue.length - 1];
  const value = JSON.parse(lastTag.split(event)[0]);

  for (const key in dataObject) {
    const pre = value[key] || '';
    const cur = dataObject[key];

    const prefix = pre ? pre + returnStatusTag(nextIndex) : pre;
    const isObject = isObjectOrArray(cur);

    value[key] = isObject ? mergeStoreValue(pre, cur, nextIndex) : prefix + cur;
  }
  return returnRecordTag(preValue, JSON.stringify(value), STORE_CHANGE_TAG.UPDATE, tagIndent);
}

/**
 * 添加 tag
 */
function returnRecordTag(
  preValue: any,
  value: Recordable | string,
  eventTag: STORE_CHANGE_TAG,
  ident: number,
) {
  const tag = returnStatusTag(ident);
  const event = returnEventTag(ident);
  if (isObjectOrArray(value)) {
    addRecordEventTag(value as Recordable, getNextIndex(ident), eventTag);
    value = JSON.stringify(value);
  }
  return `${preValue ? preValue + tag : ''}${value}${event}${eventTag}`;
}

/**
 * 递归添加对象标签
 * @param value
 */
function addRecordEventTag(value: Recordable, ident: number, eventTag: STORE_CHANGE_TAG) {
  const event = returnEventTag(ident);
  for (const key in value) {
    if (isObjectOrArray(value[key])) {
      value[key] = addRecordEventTag(value[key], getNextIndex(ident), eventTag);
      continue;
    }
    value[key] += event + eventTag;
  }
}

/**
 * 获取事件标识
 */
export function returnEventTag(ident: number) {
  const str = returnStatusTag(ident);
  return str.replaceAll(STORE_CHANGE_IDENT, STORE_EVENT_IDENT);
}
/**
 * 获取状态标识
 */
export function returnStatusTag(index: number) {
  return `${STORE_CHANGE_IDENT}${index}${STORE_CHANGE_IDENT}`;
}

/**
 * 浅拷贝对象
 */
export function lightCopy(obj: any, isShouldArray: boolean) {
  const isArr = isArray(obj);
  return isShouldArray ? [...(isArr ? obj : [])] : { ...obj };
}
