import React from 'react';
import apiClient from '../../services/api';
export default function Login({ onLogin }) {
  const [email,setEmail]=React.useState('owner@dms.local'); const [password,setPassword]=React.useState('Daraja123!');
  async function submit(e){ e&&e.preventDefault(); try { const r = await apiClient.api('/api/auth/login',{ method:'POST', body: JSON.stringify({ email,password }), headers:{'Content-Type':'application/json'} }); localStorage.setItem('token', r.token); const me = await apiClient.api('/api/auth/me'); localStorage.setItem('user', JSON.stringify(me.user)); if (onLogin) onLogin(me.user); } catch(e){ alert(e.message); } }
  return (<div style={{maxWidth:520, margin:'40px auto'}}><div className="card p-3"><h4>Login</h4><form onSubmit={submit}><input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" /><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" /><button className="btn">Login</button></form></div></div>);
}