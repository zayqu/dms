import React from 'react';
import apiClient from '../../services/api';
export default function ResetPassword(){
  const params = new URLSearchParams(window.location.search); const token = params.get('token') || '';
  const [password,setPassword]=React.useState(''); const [password2,setPassword2]=React.useState('');
  async function submit(e){ e&&e.preventDefault(); if(password!==password2) return alert('no match'); try { const res = await apiClient.api('/api/auth/reset-password',{ method:'POST', body: JSON.stringify({ token, password }), headers:{'Content-Type':'application/json'} }); if(res && res.token){ localStorage.setItem('token', res.token); const me = await apiClient.api('/api/auth/me'); localStorage.setItem('user', JSON.stringify(me.user)); window.location.href='/'; } } catch(e){ alert(e.message); } }
  return (<div style={{maxWidth:520, margin:'40px auto'}}><div className="card p-3"><h4>Reset Password</h4><form onSubmit={submit}><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password" /><input className="input" type="password" value={password2} onChange={e=>setPassword2(e.target.value)} placeholder="Confirm" /><button className="btn">Reset</button></form></div></div>);
}