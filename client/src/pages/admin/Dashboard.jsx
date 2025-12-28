// ==============================
// File: dms/client/src/pages/admin/Dashboard.jsx
// Replace previous Dashboard.jsx with this version (uses real endpoints)
// ==============================
import React from 'react';
import { useTranslation } from 'react-i18next';
import StatCard from '../../components/StatCard';
import apiClient from '../../services/api';
import { Line, Pie } from 'react-chartjs-2';
import Topbar from '../../components/Topbar';
import Sidebar from '../../components/Sidebar';
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

const LOGO_URL = '/mnt/data/5697523f-fcbf-4cd0-9c4c-923045e7f52d.png';

export default function Dashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState({});
  const [monthly, setMonthly] = React.useState({ months: [], totals: [] });
  const [payment, setPayment] = React.useState({ labels: [], values: [] });
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [theme, setTheme] = React.useState(() => localStorage.getItem('dms_theme') || 'light');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dms_theme', theme);
  }, [theme]);

  React.useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [dash, monthlyRes, payRes] = await Promise.all([
        apiClient.api('/api/reports/dashboard'),
        apiClient.api('/api/reports/monthly'),
        apiClient.api('/api/reports/payment-breakdown')
      ]);
      setData(dash || {});
      setMonthly(monthlyRes || { months: [], totals: [] });
      setPayment(payRes || { labels: [], values: [] });
    } catch (err) {
      console.error('dashboard load error', err);
    } finally { setLoading(false); }
  }

  const lineData = {
    labels: monthly.months || [],
    datasets: [
      {
        label: 'Revenue (TZS)',
        data: monthly.totals || [],
        borderColor: '#0E2B37',
        backgroundColor: '#17C0C822',
        tension: 0.25,
        fill: true
      }
    ]
  };

  const pieData = {
    labels: payment.labels || [],
    datasets: [{
      data: payment.values || [],
      backgroundColor: ['#17C0C8', '#0E2B37', '#60A5FA', '#F59E0B']
    }]
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Topbar onToggleSidebar={() => setSidebarOpen(true)} onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} theme={theme} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={(r) => { console.log('navigate', r); setSidebarOpen(false); }} />
      <div style={{ padding: 12, paddingLeft: 16, paddingRight: 16, marginTop: 8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <img src={LOGO_URL} alt="logo" style={{ width:48, height:48, borderRadius:8, objectFit:'cover' }} />
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:'var(--navy)' }}>Daraja Management Software</div>
            <div style={{ fontSize:13, color:'#6b7280' }}>Dashboard</div>
          </div>
        </div>

        <section style={{ marginBottom:12 }}>
          <div style={{ display:'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap:12 }}>
            <StatCard title="Revenue" value={`${Number(data.revenue || 0).toLocaleString()} TZS`} sub="Total revenue" icon="₮" color="#17C0C8" />
            <StatCard title="Net Profit" value={`${Number(data.netProfit || 0).toLocaleString()} TZS`} sub={`Net margin ${Number(data.netProfitMargin || 0).toFixed(2)}%`} icon="±" color="#0E2B37" />
            <StatCard title="Inventory value" value={`${Number(data.inventoryValue || 0).toLocaleString()} TZS`} sub={`${data.productCount || 0} products`} icon="📦" color="#60A5FA" />
            <StatCard title="Expenses" value={`${Number(data.totalExpenses || 0).toLocaleString()} TZS`} sub="Total expenses" icon="💸" color="#F59E0B" />
          </div>
        </section>

        <section style={{ display:'grid', gap:12 }}>
          <div className="card" style={{ paddingBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div style={{ fontWeight:700 }}>Monthly Revenue</div>
              <div style={{ fontSize:12, color:'#6b7280' }}>{loading ? 'Loading…' : 'Last 12 months'}</div>
            </div>
            <div style={{ height: 240 }}>
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
                <div style={{ flex:'1 1 260px', height:180 }}>
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
      </div>
    </div>
  );
}