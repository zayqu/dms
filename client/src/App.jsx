import React from 'react';
import { useTranslation } from 'react-i18next';
import MobileTopbar from './components/MobileTopbar';
import Sales from './pages/seller/Sales';
import Stock from './pages/seller/Stock';
import Expenses from './pages/seller/Expenses';
import Dashboard from './pages/admin/Dashboard';
import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';
import './App.css';

export default function App(){
  const { t } = useTranslation();
  const [user,setUser] = React.useState(()=> { try { return JSON.parse(localStorage.getItem('user')||'null'); } catch { return null; }});
  const [route, setRoute] = React.useState('sales');

  if (!user) return <Login onLogin={(u)=>{ setUser(u); localStorage.setItem('user', JSON.stringify(u)); }} />;

  // seller mobile-first routes
  if (user.role === 'seller') {
    return (
      <div className="mobile-shell">
        <MobileTopbar user={user} onLogout={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); }} onNavigate={setRoute} />
        <div className="mobile-content">
          {route==='sales' && <Sales user={user} />}
          {route==='stock' && <Stock />}
          {route==='expenses' && <Expenses />}
        </div>
      </div>
    );
  }

  // admin view
  return (
    <div className="admin-shell">
      <header style={{padding:12, background:'#17C0C8', color:'#fff'}}>{t('dashboard')}</header>
      <div style={{padding:12}}><Dashboard user={user} /></div>
    </div>
  );
}