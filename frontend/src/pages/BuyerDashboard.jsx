import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Truck, TrendingUp, ArrowRight, MessageCircle, LifeBuoy, Heart } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import { PageLoader } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

function MiniBarChart({ data, color = '#6366f1', valueKey = 'spent' }) {
  if (!data?.length) return <p className="text-gray-400 text-xs py-4 text-center">No data yet</p>;
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.slice(-8).map((d, i) => {
        const val = d[valueKey] || 0;
        const h = Math.max(4, (val / max) * 64);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-sm relative group" style={{ height: `${h}px`, backgroundColor: color }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded hidden group-hover:block whitespace-nowrap z-10">
                {valueKey === 'spent' ? formatCurrency(val) : val}
              </div>
            </div>
            <span className="text-xs text-gray-400 truncate w-full text-center">{(d._id||'').slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/products/buyer/analytics')
      .then(r => setAnalytics(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const ov = analytics?.overview || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Hey {user?.name}! 👋</h1>
        <p className="text-gray-500">Your shopping overview</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Total Orders',   value: ov.totalOrders || 0,              icon:<Package size={20}/>,    bg:'bg-orange-50 dark:bg-orange-900/20',  color:'text-brand-600' },
          { label:'Delivered',      value: ov.deliveredOrders || 0,          icon:<Truck size={20}/>,      bg:'bg-green-50 dark:bg-green-900/20',    color:'text-green-600' },
          { label:'Total Spent',    value: formatCurrency(ov.totalSpent||0), icon:<TrendingUp size={20}/>, bg:'bg-blue-50 dark:bg-blue-900/20',      color:'text-blue-600' },
          { label:'Total Savings',  value: formatCurrency(ov.totalSavings||0),icon:<Heart size={20}/>,    bg:'bg-pink-50 dark:bg-pink-900/20',      color:'text-pink-600' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="font-display font-bold text-xl text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-gray-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {analytics?.monthlySpending?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500"/>Monthly Spending
            </h3>
            <MiniBarChart data={analytics.monthlySpending} color="#6366f1" valueKey="spent"/>
          </div>
          <div className="card p-5">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package size={16} className="text-brand-500"/>Monthly Orders
            </h3>
            <MiniBarChart data={analytics.monthlySpending} color="#f97316" valueKey="orders"/>
          </div>
        </div>
      )}

      {/* Order status breakdown */}
      {analytics?.statusCounts && Object.keys(analytics.statusCounts).length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Order Status Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(analytics.statusCounts).map(([status, count]) => {
              const total = Object.values(analytics.statusCounts).reduce((a,b)=>a+b,0) || 1;
              const colors = { pending:'bg-yellow-400', seller_accepted:'bg-blue-400', buyer_confirmed:'bg-indigo-400', packed:'bg-violet-400', dispatched:'bg-sky-400', delivered:'bg-green-400', seller_rejected:'bg-red-400', buyer_rejected:'bg-orange-400', expired:'bg-gray-400' };
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-300 capitalize">{status.replace(/_/g,' ')}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <div className={`h-full ${colors[status]||'bg-gray-400'} rounded-full`} style={{ width:`${(count/total)*100}%` }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { to:'/products',     icon:<ShoppingBag size={22} className="text-brand-500"/>,   bg:'bg-orange-50 dark:bg-orange-900/20', title:'Browse Products', desc:'Discover local sellers' },
          { to:'/buyer/orders', icon:<Package size={22} className="text-blue-500"/>,        bg:'bg-blue-50 dark:bg-blue-900/20',     title:'My Orders',       desc:'Track all orders' },
          { to:'/wishlist',     icon:<Heart size={22} className="text-red-500"/>,           bg:'bg-red-50 dark:bg-red-900/20',       title:'Wishlist',        desc:'Saved products' },
          { to:'/support',      icon:<LifeBuoy size={22} className="text-purple-500"/>,     bg:'bg-purple-50 dark:bg-purple-900/20', title:'Support',         desc:'Get help' },
        ].map(item => (
          <Link key={item.to} to={item.to} className="card-hover p-5 flex items-center gap-4 group">
            <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>{item.icon}</div>
            <div><p className="font-semibold text-gray-900 dark:text-white">{item.title}</p><p className="text-gray-400 text-sm">{item.desc}</p></div>
            <ArrowRight size={18} className="text-gray-300 group-hover:text-brand-500 ml-auto shrink-0 transition-colors"/>
          </Link>
        ))}
      </div>
    </div>
  );
}
