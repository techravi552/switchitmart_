import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ClipboardList, TrendingUp, AlertCircle, CreditCard, Plus, ArrowRight, ShoppingBag, MessageCircle, LifeBuoy, BarChart2, Zap } from 'lucide-react';
import api from '../utils/api';
import { PageLoader } from '../components/Spinner';
import { formatCurrency, formatDate } from '../utils/helpers';

const planColors = {
  platinum: 'from-purple-500 to-indigo-600',
  gold:     'from-yellow-400 to-amber-500',
  silver:   'from-gray-400 to-gray-500',
  free:     'from-gray-200 to-gray-300',
};

function MiniBarChart({ data, color = '#f97316' }) {
  if (!data?.length) return <p className="text-gray-400 text-xs py-4 text-center">No data yet</p>;
  const max = Math.max(...data.map(d => d.revenue || d.orders || 1), 1);
  return (
    <div className="flex items-end gap-1 h-20">
      {data.slice(-8).map((d, i) => {
        const val = d.revenue || d.orders || 0;
        const h = Math.max(4, (val / max) * 80);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-sm transition-all hover:opacity-80 relative group" style={{ height: `${h}px`, backgroundColor: color }}>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded hidden group-hover:block whitespace-nowrap z-10">
                {d.revenue ? formatCurrency(d.revenue) : d.orders}
              </div>
            </div>
            <span className="text-xs text-gray-400 truncate w-full text-center">{(d._id||'').slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SellerDashboard() {
  const [data, setData]       = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/seller/dashboard'),
      api.get('/products/seller/analytics').catch(() => ({ data: null })),
    ]).then(([dashRes, analyticsRes]) => {
      setData(dashRes.data);
      setAnalytics(analyticsRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return <div className="p-8 text-center text-gray-500">Failed to load</div>;

  const { seller, subscription, stats } = data;
  const subExpired = subscription?.isExpired;
  const subProgress = subscription ? (subscription.productsUsed / subscription.productLimit) * 100 : 0;
  const planColor = planColors[subscription?.plan] || planColors.free;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Welcome, {seller.name}! 👋</h1>
          <p className="text-gray-500">{seller.shopName}</p>
        </div>
        <Link to="/seller/products/add" className="btn-primary flex items-center gap-2 w-fit"><Plus size={18}/>Add Product</Link>
      </div>

      {/* Subscription alert */}
      {(!subscription || subExpired) && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20}/>
          <div className="flex-1">
            <p className="font-semibold text-red-800 dark:text-red-300">{!subscription ? 'No active subscription' : 'Subscription expired'}</p>
            <p className="text-red-600 dark:text-red-400 text-sm">You cannot add products without an active subscription.</p>
          </div>
          <Link to="/seller/subscriptions" className="btn-primary text-sm py-2 whitespace-nowrap">Get Plan</Link>
        </div>
      )}

      {/* Subscription card */}
      {subscription && (
        <div className={`mb-6 p-5 rounded-2xl bg-gradient-to-r ${planColor} text-white shadow-lg`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Current Plan</p>
              <h2 className="font-display font-bold text-2xl mt-0.5 capitalize">{subscription.planName} Plan</h2>
              {!subExpired
                ? <p className="text-white/80 text-sm mt-1">Expires: {formatDate(subscription.expiryDate)}</p>
                : <p className="text-white/90 text-sm mt-1 font-semibold">⚠️ Expired</p>}
            </div>
            <Link to="/seller/subscriptions" className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5"><CreditCard size={14}/>Manage</Link>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/80 mb-1">
              <span>Products Used</span><span>{subscription.productsUsed}/{subscription.productLimit}</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full">
              <div className={`h-full rounded-full transition-all ${subProgress >= 90 ? 'bg-red-300' : 'bg-white'}`} style={{ width: `${Math.min(subProgress,100)}%` }}/>
            </div>
            {subscription.boostLimit !== undefined && (
              <p className="text-white/70 text-xs mt-1">Boosts: {subscription.boostsUsed}/{subscription.boostLimit === -1 ? '∞' : subscription.boostLimit}</p>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Total Products', value:stats.totalProducts,          icon:<Package size={20}/>,    color:'text-brand-600',  bg:'bg-orange-50 dark:bg-orange-900/20' },
          { label:'Total Orders',   value:stats.totalOrders,            icon:<ClipboardList size={20}/>, color:'text-blue-600', bg:'bg-blue-50 dark:bg-blue-900/20' },
          { label:'Pending',        value:stats.pendingOrders,          icon:<ShoppingBag size={20}/>, color:'text-amber-600', bg:'bg-amber-50 dark:bg-amber-900/20' },
          { label:'Revenue',        value:formatCurrency(stats.totalRevenue), icon:<TrendingUp size={20}/>, color:'text-green-600', bg:'bg-green-50 dark:bg-green-900/20' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="font-display font-bold text-xl text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-gray-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-500"/>Monthly Revenue
            </h3>
            <MiniBarChart data={analytics.monthlyRevenue} color="#f97316"/>
          </div>
          <div className="card p-5">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-blue-500"/>Monthly Orders
            </h3>
            <MiniBarChart data={analytics.monthlyRevenue?.map(d=>({...d, revenue:undefined, orders:d.orders}))} color="#6366f1"/>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to:'/seller/products', icon:<Package size={20} className="text-brand-500"/>,    title:'My Products',  desc:'Manage listings' },
          { to:'/seller/orders',   icon:<ClipboardList size={20} className="text-blue-500"/>, title:'Orders',       desc:'Accept or ship' },
          { to:'/seller/analytics',icon:<BarChart2 size={20} className="text-green-500"/>,   title:'Analytics',    desc:'Revenue & insights' },
          { to:'/chat',            icon:<MessageCircle size={20} className="text-purple-500"/>,title:'Messages',   desc:'Chat with buyers' },
        ].map(item => (
          <Link key={item.to} to={item.to} className="card-hover p-5 flex items-center gap-4 group">
            <div className="w-11 h-11 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.title}</p>
              <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-500 transition-colors shrink-0"/>
          </Link>
        ))}
      </div>
    </div>
  );
}
