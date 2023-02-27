// @ts-ignore
import { createPointListHtml } from './monitor-point';
import { createStoreChangeHtml } from './monitor-store';
import { addClassName, replaceClassName, setVisible } from '../../utils';

const root = 'ls-monitor';
type Nodes = NodeListOf<HTMLElement> | undefined;

// 注册事件
registerEvent();
function registerEvent() {
  const rootDom = document.getElementById(root);
  const body = rootDom?.querySelector('.ls-monitor-body');

  const tabs = rootDom?.querySelectorAll('.ls-monitor-tab-item');
  const tabContents = body?.querySelectorAll('.ls-monitor-body-content');

  if (!body) return;
  tabEvent(tabs as Nodes, tabContents as Nodes);
  // 创建埋点列表
  createPointListHtml(body);
  // 创建内存记录
  createStoreChangeHtml(body);
}

// 处理 tab 点击
function tabEvent(tabs: Nodes, tabContents: Nodes) {
  let index = 0;
  tabs?.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      if (index === i) return;
      addClassName(tab, 'active');
      replaceClassName(tabs[index], 'active');
      if (tabContents) {
        setVisible(tabContents[index], false);
        setVisible(tabContents[i], true);
      }
      index = i;
    });
  });
}
