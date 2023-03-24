/**
 *  本地存储监听初始化
 */
import { LOCAL, SESSION, STORE_CHANGE_IDENT, STORE_EVENT_IDENT } from '../setting';
import { DB, getDB } from './database';
import { STORE_CHANGE_TAG } from '../types';
import Task from '../core/task/Task';
import {copy, getObjectType, isEquals, isObjectOrArray, jsonObject} from '../utils';
import { scheduler } from './task/scheduler';

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
let currentStorageName: string;
export const getNextIndex = (i = 0) => ++i;
export const getPreNext = (i: number) => (i > 1 ? --i : i);

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
    currentStorageName = storageName;
    const cacheStore = cache[currentStorageName];
    cacheStore[key] = JSON.parse(store.getItem(key));
    store.setItem(key, value);
    recordChangeLog(key, value);
  };
}

/**
 * 新建数据表，记录变更日志
 */
function recordChangeLog(key: string, value: string) {
  getDB(currentStorageName).then((db) => {
    if (!db) {
      console.error('indexedDB connect error');
      return Promise.reject();
    }
    diffChangeRecordLog(key, value, db);
  });
}

/**
 * 对比两次修改结果，添加记录
 */
async function diffChangeRecordLog(key: string, value: string, db: DB) {
  const preValue = await db.getItem(key);
  const currenValue = JSON.parse(value);
  // 对比缓存和修改的值是否一致
  const storeValue = cache[currentStorageName][key];
  if (!isEquals(storeValue, currenValue)) {
    const task = new Task({
      base: { value: preValue },
      cacheValue: storeValue,
      progressValue: currenValue,
      nextTask: null,
      action: diffChangeRecordLogHost,
      cacheJsonValue: splitMemoryData(getNextIndex(), preValue),
      field: key,
      index: getNextIndex(),
    });
    task.setActioned(updateField);
    scheduler(task);
  }
}

/**
 * 更新目标字段
 */
function updateField(this: Task) {
  getDB(currentStorageName).then((db) => {
    db.put(this.update(), this.field);
  });
}

/**
 * 记录每个属性的变化, 并打上 tag
 */
function diffChangeRecordLogHost(this: Task) {
  const { cacheValue, progressValue } = this;

  if (
    isObjectOrArray(progressValue) &&
    isObjectOrArray(cacheValue) &&
    getObjectType(progressValue) === getObjectType(cacheValue)
  ) {
    return serialChildTask(this);
  }
  this.dispatch();
}

// 循环调度子任务
function serialChildTask(parentTask: Task) {
  const { index, progressValue, cacheValue, cacheJsonValue } = parentTask;
  // 初始化
  const nextTagIndent = getNextIndex(index);
  debugger;
  const eachKeys = new Set([...Object.keys(cacheValue), ...Object.keys(progressValue)]);
  // 调度子任务
  [...eachKeys].forEach((key) => {
    const cur = progressValue[key];
    const pre = cacheValue[key];

    const memoryData = cacheJsonValue![key] || null;

    const preValue = splitMemoryData(index, memoryData);
    const childTask: Task = new Task({
      ...parentTask,
      progressValue: cur,
      cacheValue: pre,
      index: nextTagIndent,
      field: key,
      action: diffChangeRecordLogHost,
      cacheJsonValue: preValue,
      nextTask: null,
    });
    // 如果当前值获取不到，代表该字段需要删除
    if (!cur) {
      childTask.setEffect(STORE_CHANGE_TAG.DELETE);
    }
    // 使用子任务的方式解决 [触发更新的时机, 插队机制]
    // scheduler(childTask);
    parentTask.addChildTask(childTask);
  });
}

// 通过标识分割解析数据
function splitMemoryData(index: number, data: string | Recordable | undefined) {
  if (!data) return null;
  if (typeof data !== 'string') return data;

  const eventData = data.split(returnStatusTag(index));
  const [jsonData] = eventData[eventData.length - 1]?.split(returnEventTag(index));

  // 如果不是对象，就直接返回 data，防止丢失事件标识
  const result = jsonObject(jsonData);
  if (!isObjectOrArray(result)) {
    return data;
  }
  return result;
}

/**
 * 添加 tag
 */
export function returnRecordTag(
  value: Recordable | string,
  eventTag: STORE_CHANGE_TAG,
  ident: number,
) {
  const event = returnEventTag(ident);
  if (isObjectOrArray(value)) {
    addRecordEventTag(value as Recordable, getNextIndex(ident), eventTag);
    value = JSON.stringify(value);
  }
  return `${value}${event}${eventTag}`;
}

/**
 * 递归添加对象标签
 * @param value
 */
export function addRecordEventTag(value: Recordable, ident: number, eventTag: STORE_CHANGE_TAG) {
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
