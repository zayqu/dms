// File: dms/client/public/service-worker.js
// This SW reads 'sw_requests' IDB store using idb (available in SW via importScripts if you bundle it).
// Because CRA dev serving does not support importScripts easily, this SW uses a minimal inline IDB access
// implemented using the IndexedDB API (no external lib) for reading the 'sw_requests' store created by idb in main thread.
// Note: keep this file simple — in production you can use Workbox and idb in the SW build.

const CACHE_NAME = 'dms-static-v1';
const ASSETS_TO_CACHE = ['/', '/index.html', '/favicon.ico', '/manifest.json', '/logo192.png', '/logo512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // network-first for API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => {
    if (cached) return cached;
    return fetch(event.request).then(resp => {
      if (event.request.method === 'GET' && resp && resp.status === 200) {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(()=>{});
      }
      return resp;
    }).catch(() => { if (event.request.mode === 'navigate') return caches.match('/index.html'); });
  }));
});

// Utility: read all entries from IndexedDB store 'sw_requests' created by idb in main thread.
// This is a minimal read-only helper; it expects the DB name 'dms-sw-db' and store 'sw_requests'.
function openSwDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('dms-sw-db', 1);
    req.onupgradeneeded = function(e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('sw_requests')) db.createObjectStore('sw_requests', { keyPath: 'id' });
    };
    req.onsuccess = function(e) { resolve(e.target.result); };
    req.onerror = function(e) { reject(e.target.error); };
  });
}

async function readAllSwRequests() {
  try {
    const db = await openSwDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sw_requests', 'readonly');
      const store = tx.objectStore('sw_requests');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return [];
  }
}

function removeSwRequest(id) {
  return openSwDb().then(db => new Promise((resolve,reject) => {
    const tx = db.transaction('sw_requests', 'readwrite');
    const store = tx.objectStore('sw_requests');
    const r = store.delete(id);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  }));
}

// Background Sync event: attempt to replay requests stored in sw_requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'dms-sync') {
    event.waitUntil((async () => {
      const clientsList = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      // notify clients that sync started
      for (const c of clientsList) c.postMessage({ type: 'dms-sync-start' });
      const requests = await readAllSwRequests();
      for (const req of requests) {
        try {
          // req.payload is expected to contain { type:'transaction', payload: { ... } }
          if (req.type === 'transaction') {
            // Need to include Authorization header - but SW can't access localStorage;
            // best-effort approach: try fetch without auth (server pending endpoint can accept unauthenticated pending if you decide)
            // We will attempt to POST to /api/transactions; if 401 occurs, fallback to POST to /api/pending (no-auth) if server allows it.
            // For security, server currently requires auth for /api/transactions and /api/pending; so SW replay will likely fail unless you enable token pass via message from client.
            // Better approach: upon background sync event, postMessage clients to let a visible client actually process the queue.
            // We'll try naive fetch; if 401/403 then notify clients.
            const apiBase = self.__API_BASE__ || '/'; // placeholder if set via injection
            const url = (self.location && self.location.origin ? self.location.origin : '') + '/api/transactions';
            const resp = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(req.payload)
            });
            if (resp.ok) {
              await removeSwRequest(req.id);
            } else {
              // if 401/403 or other, keep for retry and notify clients
              const clientsList2 = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
              for (const c of clientsList2) c.postMessage({ type: 'dms-sync-failed', id: req.id, status: resp.status });
            }
          } else {
            // unknown type -> delete
            await removeSwRequest(req.id);
          }
        } catch (err) {
          // network or other error -> leave for next attempt
          const clientsList2 = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
          for (const c of clientsList2) c.postMessage({ type: 'dms-sync-error', id: req.id, message: String(err) });
          break;
        }
      }
      for (const c of clientsList) c.postMessage({ type: 'dms-sync-done' });
    })());
  }
});

// listen to messages from clients to allow deletion from SW (if needed)
self.addEventListener('message', (evt) => {
  // currently do nothing; clients can call server-side pending endpoints instead.
});
