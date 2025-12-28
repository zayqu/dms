// dms/client/src/pages/admin/Dashboard.jsx
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
  const [counts, setCounts] = React.useState({
    today: { revenue: 0, count: 0 },
    thisWeek: { revenue: 0, count: 0 },
    thisMonth: { revenue: 0, count: 0 }
  });
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
      const [dash, monthlyRes, payRes, countsRes] = await Promise.all([
        apiClient.api('/api/reports/dashboard'),
        apiClient.api('/api/reports/monthly'),
        apiClient.api('/api/reports/payment-breakdown'),
        apiClient.api('/api/reports/counts')
      ]);
      setData(dash || {});
      setMonthly(monthlyRes || { months: [], totals: [] });
      setPayment(payRes || { labels: [], values: [] });
      setCounts(countsRes || counts);
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
    <div className="dashboard" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Topbar
        onToggleSidebar={() => setSidebarOpen(true)}
        onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        theme={theme}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(r) => { console.log('navigate', r); setSidebarOpen(false); }}
      />

      <main className="px-4 py-3 md:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <img src={LOGO_URL} alt="logo" className="w-12 h-12 rounded-lg object-cover" />
          <div>
            <h1 className="text-lg md:text-xl font-bold text-navy">Daraja Management Software</h1>
            <p className="text-sm text-gray-500">Dashboard</p>
          </div>
        </div>

        {/* Small counts - responsive grid */}
        <section className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {['today', 'thisWeek', 'thisMonth'].map(period => (
            <div key={period} className="card stat-card p-3">
              <p className="text-xs text-gray-500 capitalize">{period.replace(/([A-Z])/g, ' $1')}</p>
              <p className="text-lg font-bold">{Number(counts[period].revenue || 0).toLocaleString()} TZS</p>
              <p className="text-xs text-gray-500">{counts[period].count || 0} transactions</p>
            </div>
          ))}
        </section>

        {/* Main stat cards */}
        <section className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Revenue" value={`${Number(data.revenue || 0).toLocaleString()} TZS`} sub="Total revenue" icon="₮" color="#17C0C8" />
          <StatCard title="Net Profit" value={`${Number(data.netProfit || 0).toLocaleString()} TZS`} sub={`Net margin ${Number(data.netProfitMargin || 0).toFixed(2)}%`} icon="±" color="#0E2B37" />
          <StatCard title="Inventory Value" value={`${Number(data.inventoryValue || 0).toLocaleString()} TZS`} sub={`${data.productCount || 0} products`} icon="📦" color="#60A5FA" />
          <StatCard title="Expenses" value={`${Number(data.totalExpenses || 0).toLocaleString()} TZS`} sub="Total expenses" icon="💸" color="#F59E0B" />
        </section>

        {/* Charts and quick stats */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="card p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold">Monthly Revenue</h2>
              <p className="text-xs text-gray-500">{loading ? 'Loading…' : 'Last 12 months'}</p>
            </div>
            <div className="h-60">
              <Line data={lineData} options={{ maintainAspectRatio:false, plugins:{ legend:{ display:false } }}} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="card p-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold">Payment Methods</h2>
                <p className="text-xs text-gray-500">Distribution</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px] h-44">
                  <Pie data={pieData} options={{ maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' } }}} />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <h3 className="font-bold mb-1">Quick Stats</h3>
                  <p className="text-sm text-gray-700">Revenue: <strong>{Number(data.revenue||0).toLocaleString()} TZS</strong></p>
                  <p className="text-sm text-gray-700">Net Profit: <strong>{Number(data.netProfit||0).toLocaleString()} TZS</strong></p>
                  <p className="text-sm text-gray-700">Inventory: <strong>{Number(data.inventoryValue||0).toLocaleString()} TZS</strong></p>
                </div>
              </div>
            </div>

            <div className="card p-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold">Recent Alerts</h2>
                <p className="text-xs text-gray-500">Stock & system</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="p-2 bg-white border border-gray-200 rounded">
                  <p className="text-xs">Low stock: Beer Crate 24x330ml (200 left)</p>
                </div>
                <div className="p-2 bg-white border border-gray-200 rounded">
                  <p className="text-xs">Unpaid invoices: 0</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
