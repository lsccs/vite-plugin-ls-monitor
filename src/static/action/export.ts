// 初始化 window
import API, { styles, templateHtml, templateScript } from '../../api';

(globalThis as any).monitor = {
  setHtml,
};

/**
 * 填充模板
 */
function setHtml(selector: string) {
  if (!selector) {
    return console.error('selector is not empty!');
  }
  const container: Element | null = document.querySelector(selector);
  if (!container) {
    return console.error('There is no current element in body!');
  }
  // 请求模板文件
  API({ url: templateHtml }).then(async (res) => {
    const result = await res.text();
    if (result) {
      container.innerHTML = result;
      insertScript();
      insertStyles();
    }
  });
}

// 插入操作模板执行代码
function insertScript() {
  const script = document.createElement('script');
  script.defer = true;
  script.src = templateScript;
  document.head.appendChild(script);
}

// 插入模板样式
function insertStyles() {
  const link = document.createElement('link');
  link.href = styles;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}
