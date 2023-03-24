// 任务辅助方法
import { STORE_CHANGE_TAG } from '../../types';
import Task from './Task';
import { getPreNext, returnRecordTag, returnStatusTag } from '../memory';
import { isObjectType } from '../../utils';

export default class Helper {
  /**
   * 添加
   */
  static [STORE_CHANGE_TAG.ADD](task: Task) {
    const { cacheJsonValue } = task;

    const value = returnRecordTag(task.progressValue, STORE_CHANGE_TAG.ADD, task.index);
    task.cacheJsonValue = (cacheJsonValue || '') + value;
  }
  /**
   * 修改
   */
  static [STORE_CHANGE_TAG.UPDATE](task: Task) {
    const { progressValue, index, cacheJsonValue } = task;
    const { UPDATE } = STORE_CHANGE_TAG;

    if (cacheJsonValue) {
      task.cacheJsonValue += returnStatusTag(index) + returnRecordTag(progressValue, UPDATE, index);
    }
  }
  /**
   * 删除
   */
  static [STORE_CHANGE_TAG.DELETE](task: Task) {
    const { cacheJsonValue, index } = task;
    task.cacheJsonValue =
      (cacheJsonValue || '') + returnRecordTag('', STORE_CHANGE_TAG.DELETE, index);
  }

  // 转换 cacheJsonValue
  static transferCacheJsonValue(task: Task) {
    const { index, cacheJsonValue } = task;
    const tag = cacheJsonValue ? STORE_CHANGE_TAG.UPDATE : STORE_CHANGE_TAG.ADD;

    if (!isObjectType(cacheJsonValue)) {
      return cacheJsonValue as string;
    }

    const result = JSON.stringify(cacheJsonValue);
    const preIndex = getPreNext(index);

    return returnStatusTag(preIndex) + returnRecordTag(result, tag, preIndex);
  }
}
