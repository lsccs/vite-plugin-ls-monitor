import { LISTENING_EVENT } from '../setting';
import { pointParams } from '../type';
import { getDB } from './database';

// 埋点事件入口
window[LISTENING_EVENT] = (data: pointParams) => {
  console.log(data);
  const db = getDB();
  db?.put(data, '1');
};
