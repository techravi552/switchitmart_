import { useState, useEffect } from 'react';
import { TrendingUp, Package, ShoppingBag, Eye, Star, AlertCircle, BarChart2, Clock } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { PageLoader } from '../components/Spinner';
import { Link } from 'react-router-dom';

function BarChart({ data, valueKey = 'revenue', color = '#f97316', label = '' }) {
  if (!data?.length) return <div className="flex items-center justify-center h-24 text-gray-400 text-sm">No data yet — complete some orders</div>;
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <div>
      <div className="flex items-end gap-1.5 h-24 mb-1">
        {data.map((d, i) => {
          const val = d[valueKey] || 0;
          const h = Math.max(3, (val / max) * 96);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="relative group w-full rounded-t-sm transition-all hover:opacity-80 cursor-pointer" style={{ height: `${h}px`, backgroundColor: color }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap hidden group-hover:block z-10 pointer-events-none">
                  {valueKey === 'revenue' ? formatCurrency(val) : `${val} orders`}
                </div>
              </div>
              <span className="text-xs text-gray-400 truncate w-full text-center">{(d._id || '').slice(5)}</span>
            </div>
          );
        })}
      </div>
      {label && <p className="text-xs text-gray-400 text-center">{label}</p>}
    </div>
  );
}

const statusColors = {
  pending:'bg-yellow-100 text-yellow-700', seller_accepted:'bg-blue-100 text-blue-700',
  seller_rejected:'bg-red-100 text-red-700', buyer_confirmed:'bg-indigo-100 text-indigo-700',
  buyer_rejected:'bg-orange-100 text-orange-700', packed:'bg-violet-100 text-violet-700',
  dispatched:'bg-sky-100 text-sky-700', delivered:'bg-green-100 text-green-700',
  expired:'bg-gray-100 text-gray-600',
};

export default function SellerAnalytics() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    api.get('/products/seller/analytics')
      .then(r => setData(r.data))
      .catch(err => { if (err.response?.status === 403) setLocked(true); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  if (locked) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center animate-fade-in">
      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={32} className="text-amber-500"/>
      </div>
      <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-2">Analytics Locked</h2>
      <p className="text-gray-500 mb-6">Upgrade to <strong>Gold</strong> or <strong>Platinum</strong> plan to access detailed analytics and revenue charts.</p>
      <Link to="/seller/subscriptions" className="btn-primary inline-flex items-center gap-2"><TrendingUp size={16}/>Upgrade Plan</Link>
    </div>
  );

  if (!data) return <div className="p-8 text-center text-gray-400">No analytics data available</div>;

  const { overview, statusCounts, topProducts, monthlyRevenue } = data;
  const totalOrders = Object.values(statusCounts || {}).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
          <BarChart2 size={24} className="text-brand-500"/>Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Your store performance overview</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Total Revenue',  value: formatCurrency(overview.totalRevenue), icon:<TrendingUp size={20}/>, bg:'bg-green-50 dark:bg-green-900/20',  color:'text-green-600' },
          { label:'Total Orders',   value: overview.totalOrders,                  icon:<ShoppingBag size={20}/>,bg:'bg-blue-50 dark:bg-blue-900/20',    color:'text-blue-600' },
          { label:'Items Sold',     value: overview.totalSold,                    icon:<Package size={20}/>,    bg:'bg-orange-50 dark:bg-orange-900/20',color:'text-brand-600' },
          { label:'Product Views',  value: overview.totalViews,                   icon:<Eye size={20}/>,        bg:'bg-purple-50 dark:bg-purple-900/20',color:'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="font-display font-bold text-2xl text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-gray-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue (₹)</h3>
          <BarChart data={monthlyRevenue} valueKey="revenue" color="#f97316"/>
        </div>
        <div className="card p-5">
          <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Monthly Orders</h3>
          <BarChart data={monthlyRevenue} valueKey="orders" color="#6366f1"/>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Status breakdown */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Order Status Breakdown</h3>
          <div className="space-y-2.5">
            {Object.entries(statusCounts || {}).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${statusColors[status]||'bg-gray-100 text-gray-700'} capitalize`}>{status.replace(/_/g,' ')}</span>
                  <span className="font-bold text-gray-700 dark:text-gray-200">{count} ({Math.round((count/totalOrders)*100)}%)</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(count/totalOrders)*100}%` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star size={16} className="text-amber-500"/>Top Products
          </h3>
          {!topProducts?.length
            ? <p className="text-gray-400 text-sm py-4 text-center">Complete orders to see top products</p>
            : (
              <div className="space-y-3">
                {topProducts.map((p, i) => {
                  const img = p.product?.image ? (p.product.image.startsWith('http') ? p.product.image : `http://localhost:5000${p.product.image}`) : null;
                  return (
                    <div key={p._id} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i===0?'bg-yellow-100 text-yellow-700':i===1?'bg-gray-100 text-gray-600':'bg-orange-50 text-brand-600'}`}>{i+1}</div>
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-orange-50 dark:bg-gray-700 shrink-0">
                        {img ? <img src={img} alt="" className="w-full h-full object-cover"/> : <Package size={14} className="text-brand-300 m-auto mt-3"/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.product?.name}</p>
                        <p className="text-xs text-gray-400">{p.orders} orders</p>
                      </div>
                      <p className="text-sm font-bold text-brand-600 shrink-0">{formatCurrency(p.revenue)}</p>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
