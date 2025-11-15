import React from 'react';
import apiClient from '../services/api';
export default function ProductQuickSearch({ onSelect }) {
  const [q, setQ] = React.useState('');
  const [results, setResults] = React.useState([]);
  React.useEffect(()=> { if (!q) return setResults([]); const t = setTimeout(async ()=>{ try { const r = await apiClient.api(`/api/products/search?q=${encodeURIComponent(q)}`); setResults(r); } catch(e){ console.error(e); } }, 250); return ()=>clearTimeout(t); }, [q]);
  return (
    <div className="card">
      <input className="input" placeholder="Search product..." value={q} onChange={e=>setQ(e.target.value)} />
      <div className="product-list">
        {results.map(p=>(
          <div key={p._id} className="product-item" onClick={()=>onSelect(p)}>
            <div>
              <div style={{fontWeight:700}}>{p.name}</div>
              <div style={{fontSize:12, color:'#666'}}>{p.unit} — {p.stock} in stock</div>
            </div>
            <div style={{textAlign:'right'}}>{p.sellPrice} TZS</div>
          </div>
        ))}
      </div>
    </div>
  );
}