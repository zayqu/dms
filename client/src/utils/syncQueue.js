// File: dms/client/src/utils/syncQueue.js
// REPLACE previous localforage-only version.
// It keeps localforage queue and ALSO writes a SW-readable copy (via idb sw_requests)
// It tries to upload to server; if server returns 5xx or network fails, it attempts to POST to /api/pending
import localforage from 'localforage';
import { addSwRequest, deleteSwRequest } from './sw-idb';

const QUEUE_KEY = 'dms_sync_queue_v2';
const PROCESSING_FLAG = 'dms_sync_processing_v2';
localforage.config({ name: 'dms', storeName: 'sync_queue' });

async function _readQueue(){ const q = await localforage.getItem(QUEUE_KEY); return Array.isArray(q) ? q : []; }
async function _writeQueue(arr){ await localforage.setItem(QUEUE_KEY, arr || []); }

export async function getQueue(){ return await _readQueue(); }

export async function enqueue(type, payload){
  const q = await _readQueue();
  const id = `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
  const item = { id, type, payload, createdAt: new Date().toISOString() };
  q.push(item);
  await _writeQueue(q);
  // also write SW copy for replay
  try { await addSwRequest(item); } catch(e){ console.warn('addSwRequest failed', e); }
  // try to register background sync
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try { const reg = await navigator.serviceWorker.ready; await reg.sync.register('dms-sync'); } catch(e){ console.warn('sync register failed', e); }
  }
  if (navigator.onLine) processQueue().catch(()=>{});
  return id;
}

export async function removeItemById(id){
  // remove from both localforage queue and SW idb store
  const q = await _readQueue();
  const filtered = q.filter(it => it.id !== id);
  await _writeQueue(filtered);
  try { await deleteSwRequest(id); } catch(e){ /* ignore */ }
}

async function _isProcessing(){ return !!(await localforage.getItem(PROCESSING_FLAG)); }
async function _setProcessing(val){ if (val) await localforage.setItem(PROCESSING_FLAG, true); else await localforage.removeItem(PROCESSING_FLAG); }

export async function processQueue(){
  if (await _isProcessing()) return;
  await _setProcessing(true);
  try {
    let q = await _readQueue();
    if (!q.length) return;
    for (const item of [...q]) {
      try {
        if (item.type === 'transaction') {
          const token = localStorage.getItem('token');
          const res = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:4000'}/api/transactions`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify(item.payload)
          });
          if (!res.ok) {
            // If client is authorized and server returns 5xx (server error), push to server-side pending queue
            if (res.status >= 500) {
              try {
                const uploadRes = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:4000'}/api/pending`, {
                  method: 'POST',
                  headers: { 'Content-Type':'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                  body: JSON.stringify({ type: item.type, payload: item.payload })
                });
                if (uploadRes.ok) {
                  // remove local queued item and SW stored request
                  await removeItemById(item.id);
                  q = await _readQueue();
                  continue;
                }
              } catch (e) { /* can't reach server to create pending */ }
            }
            // 401 -> wipe auth and stop processing
            if (res.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); throw new Error('Unauthorized'); }
            // 4xx invalid -> drop it
            if (res.status >= 400 && res.status < 500) {
              await removeItemById(item.id);
              q = await _readQueue();
              continue;
            }
            throw new Error('Server error ' + res.status);
          }
          // success: remove both stores (localforage & sw idb)
          await removeItemById(item.id);
          q = await _readQueue();
          // also remove SW copy to avoid double send
          try { await deleteSwRequest(item.id); } catch(e){ /* ignore */ }
          continue;
        } else {
          // unknown type -> remove
          await removeItemById(item.id);
          q = await _readQueue();
          continue;
        }
      } catch (err) {
        console.warn('Queue processing stopped:', err && err.message ? err.message : err);
        break;
      }
    }
  } finally {
    await _setProcessing(false);
  }
}

export function startQueueProcessor(opts = {}) {
  if (navigator.onLine) processQueue().catch(()=>{});
  window.addEventListener('online', () => processQueue().catch(()=>{}));
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && navigator.onLine) processQueue().catch(()=>{}); });
  if (opts.intervalMs && Number(opts.intervalMs) > 0) setInterval(() => { if (navigator.onLine) processQueue().catch(()=>{}); }, Number(opts.intervalMs));
}

export async function flush() { await _writeQueue([]); try { const db = await (await import('./sw-idb')).getDb(); await db.clear('sw_requests'); } catch(e){ /* ignore */ } }
