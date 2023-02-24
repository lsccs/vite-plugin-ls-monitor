// @ts-ignore
import { getDB } from '../action/database';
import { DatabaseData } from '../../types';
import { innerTagStr, outTagStr, returnEventTag } from '../action/memory';
import { LOCAL } from '../../setting';
import { getID, isArray, isObject} from '../../utils';

const root = 'ls-monitor';
type Nodes = NodeListOf<HTMLElement> | undefined;
type StorageNode = { value: StorageRootNode | string; route: string[] };
type StorageRootNode = { [k in string]: StorageNode };

type ObjectTypeMap = { method: Function; start: string; end: string };
interface DivAttr {
  children?: string;
  className?: string;
  tag?: string;
  attrs?: any;
}
// 对象标识
enum objChar {
  start = '{',
  end = '}',
}

// 数组标识
enum arrayChar {
  start = '[',
  end = ']',
}
const attrClassName = 'ls-store-obj-attr';
const objectClassName = 'ls-store-obj-key';
const objectArrayMap = 'ls-store-obj-map';
const objectContainer = 'ls-store-obj-container';
const objectIndentContent = 'ls-store-indent-content';
const dataId = 'data-id';
const hide = 'hide';
const show = 'show';

// 注册事件
registerEvent();
async function registerEvent() {
  const rootDom = document.getElementById(root);
  const body = rootDom?.querySelector('.ls-monitor-body');

  const tabs = rootDom?.querySelectorAll('.ls-monitor-tab-item');
  const tabContents = body?.querySelectorAll('.ls-monitor-body-content');

  if (!body) return;
  tabEvent(tabs as Nodes, tabContents as Nodes);

  createPointListHtml(body);
  await createStoreChangeHtml(body);
  storeObjectEvent(body);
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

// 处理内存对象属性缩略点击
function storeObjectEvent(root: Element) {
  const objectMaps = root?.querySelectorAll(`.${objectContainer}`);

  objectMaps?.forEach((item) => {
    item.addEventListener('click', () => {
      const id = item.getAttribute(dataId);
      const target = document.querySelector(`.${objectIndentContent}[${dataId}="${id}"]`);
      setObjectAttrVisible(target);
    });
  });
}

// 创建内存记录标签
function createStoreChangeHtml(root: Element) {
  const className = '.ls-monitor-store-local-content';
  return getLocalAllData(LOCAL).then((data) => {
    let result = generateHtml(data, outTagStr);

    const local = root.querySelector(className);
    if (local) {
      result =
        getObjectIndentStyleDiv(objChar.start) +
        getDiv({ children: result, className: objectIndentContent });
      result += getObjectIndentStyleDiv(objChar.end);
      local.innerHTML = result;
      return Promise.resolve();
    }
  });
}

// 循环遍历json生成节点
function generateHtml(data: StorageRootNode, tagStr: string) {
  let result = '';
  for (const key in data as object) {
    const { value } = data[key];

    const objectChar = getObjectChar(value);
    // 兼容第一次循环
    if (objectChar) {
      const v = value as unknown as StorageRootNode;
      result += generateObject(v, key, objectChar, tagStr);
      continue;
    }
    result += getObjectAttrDiv(key, value as string);
  }
  return result;
}

// 生成对象节点
function generateObject(
  value: StorageRootNode,
  key: string,
  objectChar: ObjectTypeMap,
  tagStr: string,
) {
  let result = '';
  const objKey = key ? key + getColon() : '';
  const objectAttrs = generateHtml(value, tagStr);
  const htmlAttrs = { [dataId]: getID() };

  result += getDiv({
    children: objKey + getObjectAndArrayMap(objectChar),
    className: objectContainer,
    attrs: htmlAttrs,
  });
  result += getDiv({
    children: objectAttrs,
    className: objectIndentContent + ' ' + hide,
    attrs: htmlAttrs,
  });

  return result;
}

// 获取 localStorage sessionStorage
async function getLocalAllData(storage: string) {
  const data: StorageRootNode = {};
  const db = await getDB(storage);
  const keys = await db.getDBAllKeys();
  for (const k of keys) {
    const valueObj = await db.getItem(k);
    data[k.toString()] = {
      value: generateStoreData(valueObj, outTagStr),
      route: [],
    };
  }
  return data;
}

// 重新生成内存数据结构
function generateStoreData(valueObj: object, tagStr: string): StorageRootNode {
  return Object.keys(valueObj).reduce((pre, cur) => {
    const changeLog = splitStoreTag(valueObj[cur], tagStr);
    let storageRootNode: StorageRootNode | string = changeLog[changeLog.length - 1];
    try {
      const event = returnEventTag(tagStr);
      const data = JSON.parse(storageRootNode.split(event)[0]);
      if (isObject(data)) {
        storageRootNode = generateStoreData(data, innerTagStr);
      }
    } finally {
      pre[cur] = {
        value: storageRootNode,
        route: changeLog,
      };
    }
    return pre;
  }, {} as StorageRootNode);
}

// 创建埋点标签
function createPointListHtml(root: Element) {
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

// 设置元素显示隐藏
function setVisible(node: HTMLElement, show: boolean) {
  addStyle(node, {
    display: show ? 'block' : 'none',
  });
}

// 设置对象属性元素显示隐藏
function setObjectAttrVisible(node: Element | null) {
  if (!node) {
    return;
  }
  const replaceClassNames = [hide, show];
  if (node.className.includes(show)) {
    replaceClassNames.reverse();
  }
  // @ts-ignore
  replaceClassName(node, ...replaceClassNames);
}

// 添加 style
function addStyle(node: HTMLElement, style: any) {
  for (const nodeKey in style) {
    node.style[nodeKey] = style[nodeKey];
  }
}

// 添加类名
function addClassName(node: Element, name: string) {
  const has = node.className.includes(` ${name}`);
  if (!has) {
    node.className += ` ${name}`;
  }
}
// 删除类名
function replaceClassName(node: Element, name: string, value = '') {
  const has = node.className.includes(` ${name}`);
  if (has) {
    node.className = node.className.replaceAll(` ${name}`, ` ${value}`);
  }
}

// 替换内存标识
function splitStoreTag(value: string, tagStr = outTagStr) {
  if (!value) return [];
  return value.split(tagStr);
}

// 替换对象或数组缩略图
function getObjectAndArrayMap(objectChar: ObjectTypeMap) {
  return getDiv({
    children: objectChar.start + '...' + objectChar.end,
    className: objectArrayMap,
    tag: 'span',
  });
}

// 生成基本标签
function getDiv({ children, className, tag = 'div', attrs = {} }: DivAttr) {
  const attrStr = Object.keys(attrs).reduce((pre, cur) => {
    return pre + `${cur}="${attrs[cur]}" `;
  }, '');
  return `<${tag} class="${className || ''}" ${attrStr}>${children || ''}</${tag}>`;
}

// 生成对象缩进样式
function getObjectIndentStyleDiv(children?: string) {
  return getDiv({ children, className: objectClassName });
}

// 生成对象属性key-value
function getObjectAttrDiv(key: string, value: string) {
  const k = getDiv({ children: key, className: attrClassName, tag: 'span' });
  // 根据类型返回对应得样式
  const v = getDiv({ children: value, tag: 'span' });
  return getDiv({ children: k + getColon() + v });
}

// 生成冒号
function getColon() {
  return getDiv({ children: ': ', tag: 'span' });
}

// 获取对象标识
function getObjectChar(data: object | string | null): ObjectTypeMap | undefined {
  if (!data) {
    return undefined;
  }
  const map: ObjectTypeMap[] = [
    { method: isObject, start: objChar.start, end: objChar.end },
    { method: isArray, start: arrayChar.start, end: arrayChar.end },
  ];
  return map.find((item) => item.method(data));
}
