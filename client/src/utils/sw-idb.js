// File: dms/client/src/utils/sw-idb.js
// small idb helper using "idb" library so the SW and main thread can share store name/format
import { openDB } from 'idb';
const DB_NAME = 'dms-sw-db';
const STORE_NAME = 'sw_requests';

export async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    }
  });
}

export async function addSwRequest(obj) {
  const db = await getDb();
  await db.put(STORE_NAME, obj);
}

export async function getAllSwRequests() {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function deleteSwRequest(id) {
  const db = await getDb();
  return db.delete(STORE_NAME, id);
}