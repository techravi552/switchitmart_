import { useState, useEffect } from 'react';
import { Users, Package, ClipboardList, TrendingUp, ShoppingBag, Store, Activity, Zap, BarChart2 } from 'lucide-react';
import { adminApi } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/Spinner';

function MiniBar({ data, valueKey='revenue', color='#f97316' }) {
  if (!data?.length) return <p className="text-gray-400 text-xs py-3 text-center">No data</p>;
  const max = Math.max(...data.map(d=>d[valueKey]||0), 1);
  return (
    <div className="flex items-end gap-1 h-16 mt-2">
      {data.slice(-10).map((d,i)=>{
        const val=d[valueKey]||0, h=Math.max(3,(val/max)*64);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-sm group relative" style={{height:`${h}px`,backgroundColor:color}}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded hidden group-hover:block whitespace-nowrap z-10">
                {valueKey==='revenue'?formatCurrency(val):val}
              </div>
            </div>
            <span className="text-xs text-gray-400 truncate w-full text-center">{(d._id||'').slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

const StatCard = ({ label, value, icon, bg, color, sub }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <p className="font-display font-bold text-2xl text-gray-900 dark:text-white mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-11 h-11 ${bg} ${color} rounded-xl flex items-center justify-center shrink-0`}>{icon}</div>
    </div>
  </div>
);

const statusColors = {
  pending:'bg-yellow-100 text-yellow-700', seller_accepted:'bg-blue-100 text-blue-700',
  seller_rejected:'bg-red-100 text-red-700', buyer_confirmed:'bg-indigo-100 text-indigo-700',
  buyer_rejected:'bg-orange-100 text-orange-700', packed:'bg-violet-100 text-violet-700',
  dispatched:'bg-sky-100 text-sky-700', delivered:'bg-green-100 text-green-700', expired:'bg-gray-100 text-gray-600',
};

export default function AdminDashboard() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get('/dashboard').then(r=>setData(r.data)).catch(console.error).finally(()=>setLoading(false));
  }, []);

  if (loading) return <PageLoader/>;
  if (!data) return <div className="text-center text-gray-500 py-20">Failed to load</div>;

  const { stats, recentActivity, topSellers, ordersByStatus } = data;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"    value={stats.totalUsers}    icon={<Users size={20}/>}       bg="bg-blue-50"   color="text-blue-600"   sub={`${stats.totalSellers} sellers · ${stats.totalBuyers} buyers`}/>
        <StatCard label="Products"       value={stats.totalProducts} icon={<Package size={20}/>}     bg="bg-orange-50" color="text-brand-600"  sub={`${stats.activeProducts} active`}/>
        <StatCard label="Orders"         value={stats.totalOrders}   icon={<ClipboardList size={20}/>} bg="bg-purple-50" color="text-purple-600" sub={`${stats.pendingOrders} pending`}/>
        <StatCard label="Revenue"        value={formatCurrency(stats.totalRevenue)} icon={<TrendingUp size={20}/>} bg="bg-green-50" color="text-green-600" sub={`${stats.deliveredOrders} delivered`}/>
        <StatCard label="Sellers"        value={stats.totalSellers}  icon={<Store size={20}/>}       bg="bg-amber-50"  color="text-amber-600"/>
        <StatCard label="Buyers"         value={stats.totalBuyers}   icon={<ShoppingBag size={20}/>} bg="bg-pink-50"   color="text-pink-600"/>
        <StatCard label="Active Subs"    value={stats.activeSubscriptions||0} icon={<Zap size={20}/>} bg="bg-yellow-50" color="text-yellow-600"/>
        <StatCard label="Active Products"value={stats.activeProducts} icon={<BarChart2 size={20}/>}  bg="bg-indigo-50" color="text-indigo-600"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Orders by status */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-gray-900 mb-4">Orders by Status</h2>
          <div className="space-y-2">
            {(ordersByStatus||[]).map(s=>(
              <div key={s._id} className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[s._id]||'bg-gray-100 text-gray-700'}`}>
                  {(s._id||'').replace(/_/g,' ')}
                </span>
                <span className="font-bold text-gray-900">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top sellers */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-gray-900 mb-4">🏆 Top Sellers</h2>
          {!topSellers?.length ? <p className="text-gray-400 text-sm">No data yet</p> : (
            <div className="space-y-3">
              {topSellers.map((s,i)=>(
                <div key={s._id} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i===0?'bg-yellow-100 text-yellow-700':i===1?'bg-gray-100 text-gray-600':'bg-orange-50 text-brand-600'}`}>{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.info?.shopName||s.info?.name}</p>
                    <p className="text-xs text-gray-400">{s.totalOrders} orders</p>
                  </div>
                  <p className="text-sm font-bold text-brand-600 shrink-0">{formatCurrency(s.totalRevenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2"><Activity size={16} className="text-brand-500"/>Recent Activity</h2>
          <div className="space-y-2.5">
            {(recentActivity||[]).slice(0,8).map(log=>(
              <div key={log._id} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand-400 rounded-full mt-1.5 shrink-0"/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate">{log.description||log.action}</p>
                  <p className="text-xs text-gray-400">{log.actorName} · {formatDate(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
