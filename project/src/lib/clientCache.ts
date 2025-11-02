// src/lib/clientCache.ts
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'truthgen-cache';
const STORE_NAME = 'analysis-results';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

const initDB = () => {
  if (dbPromise) return dbPromise;
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'hash' });
      }
    },
  });
  return dbPromise;
};

export const cacheService = {
  async get(hash: string) {
    const db = await initDB();
    return db.get(STORE_NAME, hash);
  },
  async set(hash: string, data: any) {
    const db = await initDB();
    const result = { hash, ...data, timestamp: Date.now() };
    return db.put(STORE_NAME, result);
  },
  async clearExpired() {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    let cursor = await tx.store.openCursor();
    const oneDay = 24 * 60 * 60 * 1000;

    while (cursor) {
      if (Date.now() - cursor.value.timestamp > oneDay) {
        cursor.delete();
      }
      cursor = await cursor.continue();
    }

    await tx.done;
  }
};

// Clean up expired cache entries on startup
cacheService.clearExpired();
