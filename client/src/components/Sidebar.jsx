// ==============================
// File: dms/client/src/components/Sidebar.jsx
// New file: responsive collapsible sidebar (mobile-first)
// ==============================
import React from 'react';

export default function Sidebar({ open, onClose, onNavigate }) {
  return (
    <div>
      {/* overlay for mobile */}
      <div style={{
        display: open ? 'block' : 'none',
        position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:40
      }} onClick={onClose} />

      <aside style={{
        position: 'fixed',
        left: open ? 0 : '-260px',
        top: 0,
        bottom: 0,
        width: 260,
        background: 'linear-gradient(180deg,#ffffff,#f8fafc)',
        boxShadow: '2px 0 12px rgba(2,6,23,0.06)',
        padding: 12,
        zIndex:50,
        transition: 'left 220ms ease'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <div style={{ width:44, height:44, borderRadius:8, background:'#17C0C8' }} />
          <div style={{ fontWeight:700 }}>Daraja</div>
        </div>
        <nav style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <button className="btn" onClick={() => onNavigate('dashboard')} style={{ textAlign:'left' }}>Dashboard</button>
          <button className="btn" onClick={() => onNavigate('products')} style={{ textAlign:'left' }}>Products</button>
          <button className="btn" onClick={() => onNavigate('transactions')} style={{ textAlign:'left' }}>Transactions</button>
          <button className="btn" onClick={() => onNavigate('users')} style={{ textAlign:'left' }}>Users</button>
        </nav>
      </aside>
    </div>
  );
}