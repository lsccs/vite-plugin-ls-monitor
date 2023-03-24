import { FieldValue, TaskParams, TaskWork } from '../types';
import Helper from './helper';
import { STORE_CHANGE_TAG } from '../../types';

export default class Task {
  // 当前任务完整值引用
  readonly base: FieldValue;
  // 当前处理的字段
  readonly field: string;
  // 处理数据的标识
  private effect?: STORE_CHANGE_TAG;
  // 内存中正在进行对比的 json
  cacheJsonValue?: string | Recordable;
  // 当前正在进行对比的缓存的值
  readonly cacheValue: Recordable;
  // 当前正在进行设置的值
  readonly progressValue: Recordable;
  // 当前层级
  readonly index: number;
  // 下一个任务
  private nextTask: Task | null = null;
  // 父任务
  private parentTask: Task | null = null;

  private childTask: Task | null = null;
  private lastChildTask: Task | null = null;

  // 执行的具体任务方法
  action: TaskWork | null = null;
  // 任务完成回调
  actioned: TaskWork | null = null;

  constructor(task: TaskParams) {
    this.base = task.base;
    this.cacheValue = task.cacheValue;
    this.progressValue = task.progressValue;
    this.index = task.index;
    this.field = task.field;
    this.nextTask = task.nextTask;
    this.cacheJsonValue = task.cacheJsonValue;
    this.effect = task.effect;
    if (task.action) {
      this.action = task.action;
    }
  }

  // 执行更新, 只更新到 cacheJsonValue
  dispatch() {
    // 更新标记
    this.updateEffect();
    // 修改 cacheJsonValue
    Helper[this.effect!](this);
  }

  // 更新
  update() {
    // 生成待添加的 value
    const result: string = Helper.transferCacheJsonValue(this);
    if (result) {
      this.base.value = (this.base.value || '') + result;
    }
    return this.base.value;
  }

  // 更新标记 (一个任务只能修改一次标记)
  updateEffect() {
    if (this.effect) return;
    const { cacheJsonValue, cacheValue, progressValue } = this;
    if (!cacheJsonValue || !cacheValue) {
      return (this.effect = STORE_CHANGE_TAG.ADD);
    }
    if (cacheValue !== progressValue) {
      this.effect = STORE_CHANGE_TAG.UPDATE;
    }
  }

  // 更新父级任务的 cacheJsonValue, 子任务执行完毕之后需要同步给父任务
  syncCacheJsonValue() {
    const parentTask = this.parentTask;
    if (!this.cacheJsonValue) return;
    if (parentTask) {
      // 如果父任务没缓存的值，代表可以转 json 直接添加
      if (!parentTask.cacheJsonValue) {
        parentTask.cacheJsonValue = this.cacheJsonValue;
        return;
      }
      parentTask.cacheJsonValue[this.field] = this.cacheJsonValue;
    }
  }

  setEffect(effect: STORE_CHANGE_TAG) {
    this.effect = effect;
  }

  addChildTask(task: Task) {
    // 串行子任务
    if (this.lastChildTask) {
      this.lastChildTask.nextTask = task;
    }
    // 赋值第一个子任务
    if (!this.childTask) {
      this.childTask = task;
    }
    // 更新最后一个子任务
    this.lastChildTask = task;
    // 添加父任务
    task.parentTask = this;
  }

  // 返回下一个子任务, 并更新
  getNextChildTask() {
    if (!this.childTask) {
      this.lastChildTask = null;
    }
    return this.childTask;
  }

  // 获取父任务
  getParentTask() {
    return this.parentTask;
  }

  setAction(action: TaskWork) {
    this.action = action;
  }

  setActioned(actioned: TaskWork) {
    this.actioned = actioned;
  }

  setNextTask(nextTask: Task | null) {
    this.nextTask = nextTask;
  }

  getNextTask() {
    return this.nextTask;
  }

  setCacheJsonValue(value: string | Recordable) {
    this.cacheJsonValue = value;
  }
}
