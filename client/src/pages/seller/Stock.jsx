import React from 'react';
import apiClient from '../../services/api';
export default function Stock(){
  const [list,setList] = React.useState([]);
  React.useEffect(()=> load(), []);
  async function load(){ try { const r = await apiClient.api('/api/products'); setList(r); } catch(e){ console.error(e); } }
  async function adjust(id, delta){ try { await apiClient.api(`/api/products/${id}`, { method:'PATCH', body: JSON.stringify({ stock: delta }), headers: {'Content-Type':'application/json'} }); load(); } catch(e){ alert(e.message); } }
  return (<div><h4>Stock</h4>{list.map(p=> (<div key={p._id} className="card" style={{marginBottom:8}}><div style={{display:'flex',justifyContent:'space-between'}}><div><strong>{p.name}</strong><div className="small-muted">{p.stock} {p.unit}</div></div><div><button className="btn" onClick={()=>adjust(p._id, p.stock)}>Refresh</button></div></div></div>))}</div>);
}