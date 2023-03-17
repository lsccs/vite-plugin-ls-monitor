import Task from './task/Task';
import { STORE_CHANGE_TAG } from '../types';

export type TaskWork = (this: Task) => void;
// 任务单向链表源数据
export interface TaskParams {
  // 当前任务完整值引用
  base: FieldValue;
  // 当前处理的字段
  field: string;
  // 处理数据的标识
  readonly effect?: STORE_CHANGE_TAG;
  // 执行的具体任务方法
  readonly action?: TaskWork;

  cacheJsonValue?: string;
  // 当前正在进行对比的缓存的值
  cacheValue: Recordable;
  // 当前正在进行设置的值
  progressValue: Recordable;
  // 当前层级
  index: number;
  // 下一个任务
  nextTask: Task | null;
}

// 创建字段value的引用
export interface FieldValue {
  value: string;
}
