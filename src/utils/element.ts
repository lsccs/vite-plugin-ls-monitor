// 设置元素显示隐藏
import { hide, show } from '../enum/cssClass';

export function setVisible(node: HTMLElement, show: boolean) {
  addStyle(node, {
    display: show ? 'block' : 'none',
  });
}

// 添加 style
export function addStyle(node: HTMLElement, style: any) {
  for (const nodeKey in style) {
    node.style[nodeKey] = style[nodeKey];
  }
}

// 添加类名
export function addClassName(node: Element, name: string) {
  const has = node.className.includes(` ${name}`);
  if (!has) {
    node.className += ` ${name}`;
  }
}
// 删除类名
export function replaceClassName(node: Element, name: string, value = '') {
  const has = node.className.includes(` ${name}`);
  if (!name) {
    node.className += ` ${value}`;
    return;
  }
  if (has) {
    node.className = node.className.replaceAll(` ${name}`, ` ${value}`);
  }
}

// 设置对象属性元素显示隐藏
export function setObjectAttrVisible(node: Element | null) {
  if (!node) {
    return;
  }
  const replaceClassNames = [hide, ''];
  if (!node.className.includes(hide)) {
    replaceClassNames.reverse();
  }
  // @ts-ignore
  replaceClassName(node, ...replaceClassNames);
}
