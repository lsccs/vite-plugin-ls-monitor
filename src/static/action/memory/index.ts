/**
 *  本地存储监听初始化
 */
import { LOCAL, SESSION, STORE_CHANGE_IDENT_OUT, STORE_CHANGE_IDENT_IN } from '../../../setting';
import { DB, getDB } from '../database';
import { STORE_CHANGE_TAG } from '../../../types';
import { isEquals, isObject, copy } from '../../../utils';

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
    recordChangeLog(storageName, key, value);
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
  await diffChangeRecordLog(storeName, key, value, db);
  return Promise.resolve();
}

/**
 * 对比两次修改结果，添加记录
 */
async function diffChangeRecordLog(storeName: string, key: string, value: string, db: DB) {
  const preValue = (await db.getItem(key)) || {};
  const currenValue = JSON.parse(value);
  // 对比缓存和修改的值是否一致
  const storeValue = cache[storeName][key] || {};

  if (!isEquals(storeValue, currenValue)) {
    diffChangeRecordLogHost(preValue, currenValue, outTagStr, storeValue);
    db.put(preValue, key);
  }
}

/**
 * 记录每个属性的变化, 并打上 tag
 * 例: ||ls:add, 内层对象使用 @@
 */
function diffChangeRecordLogHost(
  preValue: any,
  currenValue: any,
  tagStr: string,
  cacheValue?: any,
) {
  // 对比的值必须为对象
  if (!isObject(currenValue)) {
    return currenValue;
  }
  let i;
  const preObjectMap = { ...(cacheValue || preValue) };
  const curKeys = Object.keys(currenValue);

  for (i = 0; i < curKeys.length; i++) {
    const k = curKeys[i];
    const cur = currenValue[k];
    // 当缓存为空时，使用 preValue
    const pre = (cacheValue || preValue)[k];
    Reflect.deleteProperty(preObjectMap, k);

    // 当前值为对象 或者 缓存的值为空，进入判断
    // 缓存值为空则设置add标记
    // 判断是否需要合并上一个值（多层对象）
    if (isObject(cur) || !pre) {
      const childTag = diffChangeRecordLogHost({ ...pre }, cur, innerTagStr);
      preValue[k] = mergeStoreValue(preValue[k], childTag, pre, tagStr);
      continue;
    }
    if (pre !== cur) {
      // cacheValue 为空时，说明是正在循环子对象，此时，需要忽略上一次的值，直接覆盖
      preValue[k] =
        (cacheValue ? preValue[k] : '') + returnRecordTag(cur, STORE_CHANGE_TAG.UPDATE, tagStr);
    }
  }
  // 查看剩余未匹配的 preKeys，标记删除
  Object.keys(preObjectMap).forEach((k) => {
    preValue[k] += returnRecordTag('', STORE_CHANGE_TAG.DELETE, tagStr);
  });
  return preValue;
}

// 截取最新得值，覆盖修改
function mergeStoreValue(preValue: string, data: any, pre: object, tagStr: string) {
  const result = returnRecordTag(
    data,
    pre ? STORE_CHANGE_TAG.UPDATE : STORE_CHANGE_TAG.ADD,
    tagStr,
  );
  if (!pre || !preValue || !isObject(pre)) {
    return `${preValue || ''}${result}`;
  }

  // 截取最新的值
  const dataObject = isObject(data) ? data : JSON.parse(data);

  const tagValue = preValue.split(tagStr);
  const lastTag = tagValue[tagValue.length - 1];
  const value = JSON.parse(lastTag.split(STORE_CHANGE_IDENT_OUT)[0]);

  for (const key in dataObject) {
    value[key] = `${value[key] || ''}${dataObject[key]}`;
  }
  const eventIdent = returnEventTag(tagStr) + STORE_CHANGE_TAG.UPDATE;
  return preValue.replace(tagValue[tagValue.length - 1], JSON.stringify(value) + eventIdent);
}

/**
 * 添加 tag
 */
export const outTagStr = '||';
export const innerTagStr = '@@';
function returnRecordTag(value: Object | string, eventTag: string, ident = outTagStr) {
  const prefix = returnEventTag(ident);
  if (isObject(value)) {
    value = JSON.stringify(value);
  }
  return `${ident}${value}${prefix}${eventTag}`;
}

/**
 * 获取事件标识
 */
export function returnEventTag(ident: string) {
  return ident === outTagStr ? STORE_CHANGE_IDENT_OUT : STORE_CHANGE_IDENT_IN;
}
