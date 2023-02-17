/**
 * 创建数据库
 */
import { DATABASE_NAME, STORE_POINT_NAME } from '../../../setting';

let db: IDBDatabase | null = null;
type Callback = (db: IDBDatabase | null) => void;

export function createDatabase(callback: Callback) {
  if (db) {
    return callback(db);
  }
  const request: IDBOpenDBRequest = window.indexedDB.open(DATABASE_NAME, 3);
  request.onsuccess = () => {
    db = request.result;
    callback(db);
  };

  request.onupgradeneeded = () => {
    request.result.createObjectStore(STORE_POINT_NAME);
  };
}

/**
 * 获取存储对象
 */
export function getDB(name = STORE_POINT_NAME): Promise<IDBObjectStore | undefined> {
  return new Promise((resolve) => {
    createDatabase((db: IDBDatabase | null) => {
      const transaction = db?.transaction([name], 'readwrite');
      resolve(transaction?.objectStore(name));
    });
  });
}
