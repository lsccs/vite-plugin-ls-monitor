// 是否为对象
export function isObject(value: any) {
  return Object.prototype.toString.call(value) === '[object Object]';
}
// 是否为数组
export function isArray(value: any) {
  return Object.prototype.toString.call(value) === '[object Array]';
}
// 是否为对象或者数组
export function isObjectOrArray(value: any) {
  return isObject(value) || isArray(value);
}
// 是否为对象或者数组
export function getObjectType(value: any) {
  return Object.prototype.toString.call(value);
}
// 是否为函数
export function isFunction(value: any) {
  return Object.prototype.toString.call(value) === '[object Function]';
}
// 是否为对象类型
export function isObjectType(value: any) {
  return typeof value === 'object';
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
