// File: client/src/utils/syncQueue.js
// Simple offline queue using localStorage (no extra deps).
// Stores items in 'dms_sync_queue' as JSON array [{ id, type, payload, createdAt }]
// Provide: enqueue, getQueue, processQueue, startQueueProcessor, flush

const QUEUE_KEY = 'dms_sync_queue';
const PROCESSING_FLAG = 'dms_sync_processing';

function _readQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Read queue failed', e);
    return [];
  }
}
function _writeQueue(arr) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(arr));
  } catch (e) {
    console.error('Write queue failed', e);
  }
}

export function getQueue() {
  return _readQueue();
}

export function enqueue(type, payload) {
  const q = _readQueue();
  const id = `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
  q.push({ id, type, payload, createdAt: new Date().toISOString() });
  _writeQueue(q);
  // trigger immediate attempt if online
  if (navigator.onLine) {
    processQueue().catch(() => {});
  }
  return id;
}

export function removeItemById(id) {
  const q = _readQueue().filter(item => item.id !== id);
  _writeQueue(q);
}

export async function processQueue() {
  // avoid concurrent runs
  if (localStorage.getItem(PROCESSING_FLAG) === '1') return;
  localStorage.setItem(PROCESSING_FLAG, '1');
  try {
    let q = _readQueue();
    if (!q.length) return;
    // process FIFO
    for (const item of [...q]) {
      try {
        // choose endpoint by type
        if (item.type === 'transaction') {
          // POST to /api/transactions
          const token = localStorage.getItem('token');
          const res = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:4000'}/api/transactions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(item.payload)
          });
          if (!res.ok) {
            // if 401, clear token and abort (force re-login)
            if (res.status === 401) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              // we stop processing further — user must re-login
              throw new Error('Unauthorized — stop queue processing');
            }
            // for other errors (4xx), remove item (to avoid permanent blockage)
            if (res.status >= 400 && res.status < 500) {
              console.warn('Dropping bad queued item', item, 'status', res.status);
              removeItemById(item.id);
              q = _readQueue();
              continue;
            }
            // for server errors (5xx), stop to retry later
            throw new Error(`Server error ${res.status}`);
          }
          // success
          removeItemById(item.id);
          q = _readQueue();
          continue;
        } else {
          console.warn('Unknown queue item type', item.type);
          removeItemById(item.id);
          q = _readQueue();
          continue;
        }
      } catch (err) {
        // network error or other -> stop processing now, will retry on next online event
        console.warn('Queue processing stopped due to error:', err && err.message ? err.message : err);
        break;
      }
    }
  } finally {
    localStorage.removeItem(PROCESSING_FLAG);
  }
}

export function startQueueProcessor(opts = {}) {
  // run on load
  if (navigator.onLine) {
    processQueue().catch((e) => { console.warn('Initial processQueue failed', e); });
  }
  // when back online
  window.addEventListener('online', () => {
    console.log('Back online — processing queue');
    processQueue().catch(e => console.warn(e));
  });
  // when tab becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      processQueue().catch(e => console.warn(e));
    }
  });
  // optionally process periodically
  if (opts.intervalMs && Number(opts.intervalMs) > 0) {
    setInterval(() => {
      if (navigator.onLine) processQueue().catch(e => {});
    }, Number(opts.intervalMs));
  }
}

export function flush() {
  _writeQueue([]);
}