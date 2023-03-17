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
 * @param task
 */
function progressNextTask(task: Task): Task | null {
  task.action && task.action();
  task.actioned && task.actioned();
  console.log(task.getNextTask(), '准备执行下一个任务');
  return task.getNextTask();
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
