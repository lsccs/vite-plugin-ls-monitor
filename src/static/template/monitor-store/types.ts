interface StorageNode {
  value: StorageRootNode | string;
  route: string[];
  tagStr: string;
  eventStr: string;
}

export interface DivAttr {
  children?: string;
  className?: string;
  tag?: string;
  attrs?: any;
}

export interface ObjectTypeMap {
  method: Function;
  start: string;
  end: string;
}

// 拆分事件标识
export interface EventValue {
  value: string;
  tag: string;
  tags: string[];
}

export type StorageRootNode = { [k in string]: StorageNode };

// 对象标识
export enum objChar {
  start = '{',
  end = '}',
}

// 数组标识
export enum arrayChar {
  start = '[',
  end = ']',
}
