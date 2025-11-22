// File: client/src/components/StatCard.jsx
import React from 'react';

export default function StatCard({ title, value, sub, icon, color }) {
  return (
    <div className="card stat-card" style={{ borderLeft: `6px solid ${color || '#17C0C8'}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width:48, height:48, borderRadius:10, background: `${color || '#17C0C8'}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color: color || '#17C0C8' }}>
          {icon || '₮'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, color:'#6b7280' }}>{title}</div>
          <div style={{ fontSize:18, fontWeight:700, marginTop:4 }}>{value}</div>
          {sub && <div style={{ fontSize:12, color:'#9ca3af', marginTop:6 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}