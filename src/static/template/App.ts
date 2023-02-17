// @ts-ignore
import { getDB } from '../action/database';
import { DatabaseData } from '../../types';

const root = 'ls-monitor';
type Nodes = NodeListOf<HTMLElement> | undefined;
// 注册事件
registerEvent();
function registerEvent() {
  const rootDom = document.getElementById(root);
  const body = rootDom?.querySelector('.ls-monitor-body');

  const tabs = rootDom?.querySelectorAll('.ls-monitor-tab-item');
  const tabContents = body?.querySelectorAll('.ls-monitor-body-content');

  tabEvent(tabs as Nodes, tabContents as Nodes);
  createPointListHtml(tabContents as Nodes);
}

// 处理 tab 点击
function tabEvent(tabs: Nodes, tabContents: Nodes) {
  let index = 0;
  tabs?.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      if (index === i) return;
      addClassName(tab, 'active');
      removeClassName(tabs[index], 'active');
      if (tabContents) {
        setVisible(tabContents[index], false);
        setVisible(tabContents[i], true);
      }
      index = i;
    });
  });
}

// 创建埋点标签
function createPointListHtml(contents: Nodes) {
  if (!contents) return;
  const listClass = 'ls-monitor-point-list';
  const itemClass = 'ls-monitor-point-item';

  const pointContainer = [...contents.values()].find((item) => item.className.includes(listClass));

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
    setHtml(pointContainer, result.join());
  });
}

// 获取indexDB埋点数据
async function getIndexDBData(): Promise<DatabaseData[] | null> {
  const db = await getDB();
  return new Promise((resolve) => {
    const request = db?.getAll();
    if (!request) {
      return null;
    }
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

// 填充 html
function setHtml(node: HTMLElement | undefined, html: string) {
  if (!node) return;
  node.innerHTML = html;
}

// 设置元素显示隐藏
function setVisible(node: HTMLElement, show: boolean) {
  addStyle(node, {
    display: show ? 'block' : 'none',
  });
}

// 添加 style
function addStyle(node: HTMLElement, style: any) {
  for (const nodeKey in style) {
    node.style[nodeKey] = style[nodeKey];
  }
}

// 添加类名
function addClassName(node: HTMLElement, name: string) {
  const has = node.className.includes(` ${name}`);
  if (!has) {
    node.className += ` ${name}`;
  }
}
// 删除类名
function removeClassName(node: HTMLElement, name: string) {
  const has = node.className.includes(` ${name}`);
  if (has) {
    node.className = node.className.replaceAll(` ${name}`, '');
  }
}
