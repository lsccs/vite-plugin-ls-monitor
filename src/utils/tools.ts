import path from 'path';
import { stat, readdir } from 'fs-extra';
import {isFunction, isObjectType} from './type';

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

// json 转对象
export function jsonObject(data: any) {
  return isObjectType(data) ? data : JSON.parse(data);
}
