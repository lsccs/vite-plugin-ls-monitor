// 调度任务
import Task from './Task';

// 正在进行的任务
let progressTask: Task | null;
// 最后一个任务
let lastTask: Task | null;

const { port1, port2 } = new MessageChannel();
port2.onmessage = startScheduler;

/**
 * 开始调度任务
 * @param task
 */
export function scheduler(task: Task) {
  // MessageChannel 异步，所以可以先通知，再赋值
  if (!progressTask) {
    port1.postMessage(null);
  }
  schedulerTask(task);
}

/**
 * 执行每一个任务
 */
function startScheduler() {
  while (progressTask !== null) {
    progressTask = progressNextTask(progressTask);
  }
}

/**
 * 开始执行，并返回下一个任务
 * 首先执行当前任务，然后获取第一个子任务
 *   - 如果子任务存在
 *      - 开始执行子任务
 *   - 如果子任务不存在 (此时执行成功回调)
 *      - 父任务不存在，代表可以直接开始执行下一个任务
 *      - 父任务存在，代表需要执行 子任务的 父级的 下一个任务
 *
 * 目的：将任务分为两个维度, 可以实现分批执行成功回调
 * @param task
 */
function progressNextTask(task: Task): Task | null {
  debugger;
  task.action && task.action();
  const nextChildTask = task.getNextChildTask();

  const parentTask = task.getParentTask();
  if (!nextChildTask) {
    const willActionTask = task.getNextTask() || !parentTask ? task : parentTask;
    task.syncCacheJsonValue();
    willActionTask.actioned && willActionTask.actioned();
    return willActionTask.getNextTask();
  }
  return nextChildTask;
}

/**
 * 设置保存进行中的任务, 并串联下一个任务
 * @param task
 */
function schedulerTask(task: Task) {
  if (lastTask) {
    lastTask.setNextTask(task);
  }
  if (!progressTask) {
    progressTask = task;
  }
  lastTask = task;
}
