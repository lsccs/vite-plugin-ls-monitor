/**
 * 创建数据库
 */
createDatabase();
let db: IDBDatabase | null = null;

export function createDatabase() {
  const request: IDBOpenDBRequest = window.indexedDB.open('database', 3);

  request.onsuccess = () => {
    db = request.result;
    db?.createObjectStore('name', { keyPath: 'uid' });
  };
}

/**
 * 获取存储对象
 * @param name
 */
export function getDB(name = 'name'): IDBObjectStore | undefined {
  const transaction = db?.transaction([name], 'readwrite');
  return transaction?.objectStore(name);
}
