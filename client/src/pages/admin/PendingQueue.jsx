// File: dms/client/src/pages/admin/PendingQueue.jsx
import React from 'react';
import apiClient from '../../services/api';

export default function PendingQueue() {
  const [items,setItems] = React.useState([]);
  const [loading,setLoading] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await apiClient.api('/api/pending');
      setItems(res || []);
    } catch (err) {
      alert('Failed to load pending: ' + err.message);
    } finally { setLoading(false); }
  }

  React.useEffect(()=>{ load(); }, []);

  async function processOne(id) {
    if (!confirm('Process this pending item now?')) return;
    try {
      await apiClient.api(`/api/pending/${id}/process`, { method: 'POST' });
      alert('Processed (or failed) — refresh list');
      load();
    } catch (err) { alert('Process failed: ' + err.message); }
  }

  async function removeOne(id) {
    if (!confirm('Delete this pending item?')) return;
    try {
      await apiClient.api(`/api/pending/${id}`, { method: 'DELETE' });
      load();
    } catch (err) { alert('Delete failed: ' + err.message); }
  }

  return (
    <div style={{ padding:12 }}>
      <h3>Pending items (server-side)</h3>
      <div style={{ marginBottom:8 }}>
        <button className="btn" onClick={load}>Refresh</button>
      </div>
      <div style={{ display:'grid', gap:8 }}>
        {items.length===0 && <div className="card">No pending items</div>}
        {items.map(it => (
          <div key={it._id} className="card">
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontWeight:700 }}>{it.type}</div>
                <div style={{ fontSize:12, color:'#6b7280' }}>{new Date(it.createdAt).toLocaleString()} by {String(it.createdBy||'')}</div>
                <div style={{ marginTop:8 }}><pre style={{ whiteSpace:'pre-wrap' }}>{JSON.stringify(it.payload, null, 2)}</pre></div>
                {it.status && <div style={{ fontSize:12, color:'#9ca3af' }}>Status: {it.status}{it.lastError?(' — '+it.lastError):''}</div>}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <button className="btn" onClick={()=>processOne(it._id)}>Process</button>
                <button className="btn" style={{ background:'#c0392b' }} onClick={()=>removeOne(it._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
