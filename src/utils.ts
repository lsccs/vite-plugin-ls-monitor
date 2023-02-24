import path from 'path';
import { stat, readdir } from 'fs-extra';

export const resolve = (filePath: string) => path.resolve(__dirname, filePath);

let id = 0;
export const getID = () => ++id;

// 日期格式化
export function dateFormat(date: Date, fmt = 'YYYY-mm-dd HH:MM:SS') {
  let ret;
  const opt = {
    'Y+': date.getFullYear().toString(), // 年
    'm+': (date.getMonth() + 1).toString(), // 月
    'd+': date.getDate().toString(), // 日
    'H+': date.getHours().toString(), // 时
    'M+': date.getMinutes().toString(), // 分
    'S+': date.getSeconds().toString(), // 秒
  };
  for (const k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt);
    if (ret) {
      fmt = fmt.replace(ret[1], ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, '0'));
    }
  }
  return fmt;
}

// 获取MIME
export function getMIME(name: string): string | undefined {
  return {
    js: 'application/x-javascript',
    html: 'text/html',
    css: 'text/css',
  }[name];
}

// 遍历文件夹
export function readDirAndFile(path: string, cb: Function, dir?: string) {
  const fullPath = dir ? dir + '/' + path : path;
  stat(fullPath, (err, stats) => {
    const isDir = stats.isDirectory();
    if (isDir) {
      readdir(fullPath, (_, files) => {
        files.forEach((file) => readDirAndFile(file, cb, fullPath));
      });
    } else {
      cb(path, fullPath);
    }
  });
}

// 是否为对象
export function isObject(value: any) {
  return Object.prototype.toString.call(value) === '[object Object]';
}
// 是否为数组
export function isArray(value: any) {
  return Object.prototype.toString.call(value) === '[object Array]';
}
// 是否为函数
export function isFunction(value: any) {
  return Object.prototype.toString.call(value) === '[object Function]';
}
// 是否为对象类型
export function isObjectType(value: any) {
  return typeof value === 'object';
}

// 拷贝只读属性
export function copy(obj: object, exclude: string[]) {
  const data = {};
  for (const key in obj) {
    if (!exclude.includes(key)) {
      data[key] = (...arg: any[]) => (isFunction(obj[key]) ? obj[key](...arg) : obj[key]);
    }
  }
  return data;
}

// 判断两个对象是否相等
export function isEquals(source: object, target: object) {
  if (!source || !target) {
    return false;
  }
  if (Object.keys(source).length !== Object.keys(target).length) {
    return false;
  }

  for (const key in source) {
    if (isObjectType(target[key]) && isObjectType(source[key])) {
      if (!isEquals(source[key], target[key])) {
        return false;
      }
      continue;
    }

    if (target[key] !== source[key]) {
      return false;
    }
  }
  return true;
}
