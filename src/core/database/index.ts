/**
 * 创建数据库
 */
import { DATABASE_NAME, STORE_LIST, STORE_POINT_NAME } from '../../setting';

let db: IDBDatabase | null = null;
type Callback = (db: IDBDatabase | null) => void;

type GetItem = (key: IDBValidKey | IDBKeyRange) => Promise<any>;
export type DB = {
  getItem: GetItem;
  getDBAllKeys: () => Promise<IDBValidKey[]>;
  getDBAll: () => Promise<any>;
} & IDBObjectStore;

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
    STORE_LIST.forEach((name) => {
      request.result.createObjectStore(name);
    });
  };
}

/**
 * 获取存储对象
 */
export function getDB(name = STORE_POINT_NAME): Promise<DB> {
  return new Promise((resolve) => {
    createDatabase((db: IDBDatabase | null) => {
      const transaction = db?.transaction([name], 'readwrite');
      const resultDB = transaction?.objectStore(name);
      resolve(createDB(resultDB as DB));
    });
  });
}

/**
 * 增加db方法
 */
function createDB(db: DB): DB {
  if (!db) return db;
  const get = (k: IDBValidKey | IDBKeyRange) => db.get(k);
  const getAll = () => db.getAll();
  const getAllKeys = () => db.getAllKeys();

  db.getItem = (key: IDBValidKey | IDBKeyRange) => {
    return new Promise((resolve) => {
      const request = get(key);
      if (!request) return resolve(undefined);
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  };

  db.getDBAll = () => {
    return new Promise((resolve) => {
      const request = getAll();
      if (!request) return resolve([]);
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  };

  db.getDBAllKeys = () => {
    return new Promise((resolve) => {
      const request = getAllKeys();
      if (!request) return resolve([]);
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  };
  return db;
}
