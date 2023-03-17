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
  private nextTask: Task | null;

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
    console.log(this, 'this');
  }

  // 更新
  update() {
    // 生成待添加的 value
    const result: string = Helper.transferCacheJsonValue(this);
    console.log(result, 'result');
    if (result) {
      // 赋值 base value
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

  setEffect(effect: STORE_CHANGE_TAG) {
    this.effect = effect;
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
}
