import React from 'react';
import apiClient from '../services/api';

export default function SellerSaleForm({ onSaved }) {
  const [items, setItems] = React.useState([]);
  const [paymentMethod, setPaymentMethod] = React.useState('Mpesa');
  const addLine = (product) => setItems(prev => [...prev, { productId: product._id, name: product.name, qty:1, unitPrice: product.sellPrice }]);
  const updateLine = (i, key, val) => { const copy = items.slice(); copy[i][key] = key==='qty' || key==='unitPrice' ? Number(val) : val; setItems(copy); };
  const removeLine = (i) => setItems(items.filter((_,idx)=>idx!==i));
  const submit = async () => {
    if (items.length===0) return alert('Add items');
    const payload = { type:'sale', items: items.map(it=>({ productId: it.productId, qty: it.qty, unitPrice: it.unitPrice })), paymentMethod };
    try {
      await apiClient.api('/api/transactions', { method:'POST', body: JSON.stringify(payload), headers: {'Content-Type':'application/json'} });
      setItems([]); if (onSaved) onSaved();
      alert('Sale recorded');
    } catch (err) { alert(err.message || 'Save failed'); }
  };
  const total = items.reduce((s,i)=>s + (i.qty*i.unitPrice), 0);
  return (
    <div>
      <div className="card">
        <div style={{fontWeight:700, marginBottom:8}}>Sale</div>
        <div>
          <label>Payment</label>
          <select className="input" value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}>
            <option>Mpesa</option><option>AirtelMoney</option><option>Cash</option><option>Bank</option>
          </select>
        </div>
        <div style={{marginTop:8}}>
          {items.map((it,i)=>(
            <div key={i} style={{display:'flex', gap:8, marginBottom:6}}>
              <div style={{flex:1}}><div style={{fontWeight:700}}>{it.name}</div></div>
              <input className="input" style={{width:80}} type="number" value={it.qty} onChange={e=>updateLine(i,'qty',e.target.value)} />
              <input className="input" style={{width:100}} type="number" value={it.unitPrice} onChange={e=>updateLine(i,'unitPrice',e.target.value)} />
              <button className="btn" onClick={()=>removeLine(i)}>X</button>
            </div>
          ))}
        </div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8}}>
          <div style={{fontWeight:700}}>Total: {total} TZS</div>
          <button className="btn" onClick={submit}>Complete Sale</button>
        </div>
      </div>
      <div style={{marginTop:8}}>
        <slot name="search"></slot>
      </div>
    </div>
  );
}