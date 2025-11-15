import React from 'react';
export default function MobileTopbar({ user, onLogout, onNavigate }) {
  return (
    <div className="topbar">
      <div>
        <div style={{fontWeight:700}}>{user && user.name}</div>
        <div style={{fontSize:12, opacity:0.9}}>TZS</div>
      </div>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <button className="btn" onClick={()=>onNavigate('sales')}>Sales</button>
        <button className="btn" onClick={()=>onNavigate('stock')}>Stock</button>
        <button className="btn" onClick={()=>onNavigate('expenses')}>Expenses</button>
        <button className="btn" onClick={onLogout} style={{background:'#c0392b'}}>Logout</button>
      </div>
    </div>
  );
}