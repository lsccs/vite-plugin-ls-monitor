import { LISTENING_EVENT } from '../../setting';
import { DatabaseData, pointParams } from '../../types';
import { getDB } from './database';
import { dateFormat } from '../../utils';

// 埋点事件入口
window[LISTENING_EVENT] = async (data: pointParams) => {
  const db = await getDB();

  // 读取数据库中有没有重复的
  const currentData: DatabaseData | undefined = await db?.getItem(data.id);
  const result: DatabaseData = createDatabaseData(data);

  if (currentData) {
    result.count += currentData.count;
  }
  db?.put(result, data.id);
};

function createDatabaseData(data: pointParams): DatabaseData {
  return {
    event: data.event,
    methodName: data.methodName,
    componentPath: data.ctx.$.type.__file,
    data: data.data,
    count: 1,
    createTime: dateFormat(new Date()),
  } as DatabaseData;
}
