
// 创建字段value的引用
interface FieldValue {
  value: string;
}

// 内存添加任务
export interface Task {
  // 当前任务完整值引用
  base: FieldValue;
  // 当前正在进行对比的值
  contrastValue: string;
  // 当前正在进行设置的值
  progressValue: Recordable;
}
