// 创建埋点标签
import { DatabaseData } from '../../../types';
import { getDB } from '../../../core/database';

export function createPointListHtml(root: Element) {
  const listClass = '.ls-monitor-point-list';
  const itemClass = 'ls-monitor-point-item';

  const pointContainer = root.querySelector(listClass);

  getIndexDBData().then((data: DatabaseData[] | null) => {
    if (!data) return;
    const result: string[] = [];
    data.forEach((item) => {
      const div = `<div class="${itemClass}">${item.createTime}
        触发事件：${item.event}
        行为：${item.data}
        目标方法：${item.methodName}
        共触发：${item.count} 次
        组件位置：${item.componentPath}</div>`;
      result.push(div);
    });
    setHtml(pointContainer, result.join(''));
  });
}

// 获取indexDB埋点数据
async function getIndexDBData(): Promise<DatabaseData[] | null> {
  const db = await getDB();
  return db.getDBAll();
}

// 填充 html
function setHtml(node: Element | null, html: string) {
  if (!node) return;
  node.innerHTML = html;
}
