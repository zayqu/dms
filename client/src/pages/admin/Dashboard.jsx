// File: client/src/pages/admin/Dashboard.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import StatCard from '../../components/StatCard';
import apiClient from '../../services/api';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const LOGO_URL = '/mnt/data/5697523f-fcbf-4cd0-9c4c-923045e7f52d.png'; // local logo path you supplied

export default function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState({
    revenue: 0, cogs: 0, totalExpenses: 0, netProfit: 0, netProfitMargin: 0, inventoryValue: 0, productCount: 0
  });
  const [monthlySeries, setMonthlySeries] = React.useState({ labels: [], values: [] });
  const [paymentBreakdown, setPaymentBreakdown] = React.useState({ labels: [], values: [] });

  React.useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await apiClient.api('/api/reports/dashboard');
      setData(res);
      // for demo: build placeholder monthly data and payment breakdown
      // In future we will provide endpoints returning real monthly and payment breakdown arrays.
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      // Simple fake series: spread revenue across months if revenue exists, else zeros
      const baseRevenue = Number(res.revenue || 0);
      const monthly = months.map((m,i) => Math.round(baseRevenue * ( (i+1)/12 ) * 0.08 )); // demo synthetic
      setMonthlySeries({ labels: months, values: monthly });
      // payment breakdown placeholder (if you extend the API, replace)
      setPaymentBreakdown({
        labels: ['Cash', 'Mpesa', 'Airtel', 'Other'],
        values: [Math.round(baseRevenue*0.4), Math.round(baseRevenue*0.45), Math.round(baseRevenue*0.1), Math.round(baseRevenue*0.05)]
      });
    } catch (err) {
      console.error('dashboard load error', err);
      // keep defaults
    } finally {
      setLoading(false);
    }
  }

  const lineData = {
    labels: monthlySeries.labels,
    datasets: [
      {
        label: 'Revenue (TZS)',
        data: monthlySeries.values,
        borderColor: '#0E2B37',
        backgroundColor: '#17C0C822',
        tension: 0.3,
        fill: true,
      }
    ]
  };

  const pieData = {
    labels: paymentBreakdown.labels,
    datasets: [{
      data: paymentBreakdown.values,
      backgroundColor: ['#17C0C8', '#0E2B37', '#60A5FA', '#F59E0B']
    }]
  };

  return (
    <div style={{ padding: 12, paddingBottom: 80 }}>
      <header style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
        <img src={LOGO_URL} alt="DMS" style={{ width:48, height:48, borderRadius:8, objectFit:'cover', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }} />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:18, fontWeight:700, color:'#0e2b37' }}>Daraja Management Software</div>
          <div style={{ fontSize:13, color:'#6b7280' }}>Dashboard</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn" onClick={() => { /* toggle theme placeholder*/ }} style={{ background:'#0E2B37' }}>Dark</button>
          <button className="btn" onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </header>

      <main>
        <section style={{ marginBottom:12 }}>
          <div style={{ display:'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap:12 }}>
            <StatCard title="Revenue" value={`${Number(data.revenue || 0).toLocaleString()} TZS`} sub="Total revenue" icon="₮" color="#17C0C8" />
            <StatCard title="Net Profit" value={`${Number(data.netProfit || 0).toLocaleString()} TZS`} sub={`Net margin ${Number(data.netProfitMargin || 0).toFixed(2)}%`} icon="±" color="#0E2B37" />
            <StatCard title="Inventory value" value={`${Number(data.inventoryValue || 0).toLocaleString()} TZS`} sub={`${data.productCount || 0} products`} icon="📦" color="#60A5FA" />
            <StatCard title="Expenses" value={`${Number(data.totalExpenses || 0).toLocaleString()} TZS`} sub="Total expenses" icon="💸" color="#F59E0B" />
          </div>
        </section>

        <section style={{ display:'grid', gridTemplateColumns: '1fr', gap:12 }}>
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div style={{ fontWeight:700 }}>Monthly Revenue</div>
              <div style={{ fontSize:12, color:'#6b7280' }}>{loading ? 'Loading…' : 'Last 12 months'}</div>
            </div>
            <div style={{ height: 220 }}>
              <Line data={lineData} options={{ maintainAspectRatio:false, plugins:{ legend:{ display:false } }}} />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: '1fr', gap:12 }}>
            <div className="card" style={{ paddingBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ fontWeight:700 }}>Payment Methods</div>
                <div style={{ fontSize:12, color:'#6b7280' }}>Distribution</div>
              </div>
              <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ flex:'1 1 240px', height:160 }}>
                  <Pie data={pieData} options={{ maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' } }}} />
                </div>
                <div style={{ flex:'1 1 160px' }}>
                  <div style={{ fontWeight:700, marginBottom:8 }}>Quick stats</div>
                  <div style={{ fontSize:14, color:'#374151' }}>Revenue: <strong>{Number(data.revenue||0).toLocaleString()} TZS</strong></div>
                  <div style={{ fontSize:14, color:'#374151' }}>Net Profit: <strong>{Number(data.netProfit||0).toLocaleString()} TZS</strong></div>
                  <div style={{ fontSize:14, color:'#374151' }}>Inventory: <strong>{Number(data.inventoryValue||0).toLocaleString()} TZS</strong></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ fontWeight:700 }}>Recent Alerts</div>
                <div style={{ fontSize:12, color:'#6b7280' }}>Stock & system</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ padding:8, background:'#fff', borderRadius:8, border:'1px solid #eef2f7' }}>
                  <div style={{ fontSize:13 }}>Low stock: Beer Crate 24x330ml (200 left)</div>
                </div>
                <div style={{ padding:8, background:'#fff', borderRadius:8, border:'1px solid #eef2f7' }}>
                  <div style={{ fontSize:13 }}>Unpaid invoices: 0</div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}