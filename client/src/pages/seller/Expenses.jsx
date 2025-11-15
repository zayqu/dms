import React from 'react';
import apiClient from '../../services/api';
export default function Expenses(){
  const [desc,setDesc]=React.useState(''); const [amt,setAmt]=React.useState('');
  async function save(){ if(!desc||!amt) return alert('fill'); try { await apiClient.api('/api/expenses',{ method:'POST', body: JSON.stringify({ description:desc, amount: Number(amt) }), headers: {'Content-Type':'application/json'} }); setDesc(''); setAmt(''); alert('Saved'); } catch(e){ alert(e.message); } }
  return (<div><div className="card"><h4>Record Expense</h4><input className="input" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} /><input className="input" placeholder="Amount" type="number" value={amt} onChange={e=>setAmt(e.target.value)} /><button className="btn" onClick={save}>Save</button></div></div>);
}