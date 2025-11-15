import React from 'react';
import apiClient from '../../services/api';
export default function Dashboard(){
  const [data,setData]=React.useState(null);
  React.useEffect(()=>{ apiClient.api('/api/reports/dashboard').then(setData).catch(e=>console.error(e)); },[]);
  if(!data) return <div>Loading...</div>;
  return (<div><h3>Dashboard</h3><div className="card"><div>Revenue: {data.revenue} TZS</div><div>Net Profit: {data.netProfit} TZS</div><div>Inventory value: {data.inventoryValue} TZS</div></div></div>);
}