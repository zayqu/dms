// ==============================
// File: dms/client/src/components/Topbar.jsx
// New file: Topbar with theme toggle and mobile hamburger
// ==============================
import React from 'react';

export default function Topbar({ onToggleSidebar, onThemeToggle, theme }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:12, background: 'var(--brand)', color:'#fff', gap:12
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={onToggleSidebar} style={{
          background:'transparent', border:'none', color:'#fff', fontSize:20, padding:6, marginRight:6
        }}>☰</button>
        <div style={{ fontWeight:700, fontSize:16 }}>DMS</div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <button className="btn" onClick={onThemeToggle} style={{ background: theme === 'dark' ? '#0E2B37' : '#ffffff22', color:'#fff' }}>
          {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>
    </div>
  );
}