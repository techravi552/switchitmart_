import { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Truck, Package, MapPin, Clock, Loader, Box, Send } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { PageLoader } from '../components/Spinner';
import toast from 'react-hot-toast';

const ALL_TABS = ['all','pending','seller_accepted','buyer_confirmed','packed','dispatched','delivered','seller_rejected','buyer_rejected','expired'];
const sCfg = {
  pending:         { label:'Pending',        cls:'status-pending',   icon:<Clock size={12}/>   },
  seller_accepted: { label:'Accepted',       cls:'status-accepted',  icon:<CheckCircle size={12}/> },
  seller_rejected: { label:'Rejected',       cls:'status-rejected',  icon:<XCircle size={12}/> },
  // buyer_confirmed: { label:'Confirmed',cls:'status-accepted',  icon:<CheckCircle size={12}/> },
  // buyer_rejected:  { label:'Buyer Rejected', cls:'status-rejected',  icon:<XCircle size={12}/> },
  packed:          { label:'Packed',         cls:'bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-full', icon:<Box size={12}/> },
  dispatched:      { label:'Out for Delivery',cls:'bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full', icon:<Send size={12}/> },
  delivered:       { label:'Delivered',      cls:'status-delivered', icon:<Truck size={12}/> },
  expired:         { label:'Expired',        cls:'bg-gray-100 text-gray-500 border border-gray-200 text-xs font-semibold px-2.5 py-1 rounded-full', icon:<Clock size={12}/> },
};
const SHORT = { all:'All',pending:'Pending',seller_accepted:'Accepted',buyer_confirmed:'Confirmed',packed:'Packed',dispatched:'Dispatched',delivered:'Delivered',seller_rejected:'S.Rejected',buyer_rejected:'B.Rejected',expired:'Expired' };

// Countdown for pending orders
function Countdown({ deadline }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const calc = () => Math.max(0, Math.round((new Date(deadline) - Date.now()) / 1000));
    setSecs(calc());
    const t = setInterval(() => setSecs(calc()), 1000);
    return () => clearInterval(t);
  }, [deadline]);
  if (secs <= 0) return <span className="text-red-500 text-xs font-bold">⏰ Time up!</span>;
  const m = Math.floor(secs / 60), s = secs % 60;
  const urgent = secs < 120;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${urgent ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-amber-100 text-amber-700'}`}>
      ⏱ {m}:{String(s).padStart(2,'0')} left
    </span>
  );
}

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [actId, setActId] = useState(null);

  const fetch = () => {
    setLoading(true);
    const p = tab !== 'all' ? `?status=${tab}` : '';
    api.get(`/orders/seller${p}`)
      .then(r => setOrders(r.data.orders))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [tab]);

  // Poll every 30s to catch auto-expired
  useEffect(() => { const t = setInterval(fetch, 30000); return () => clearInterval(t); }, [tab]);

  const doAction = async (orderId, action) => {
    setActId(orderId + action);
    try {
      await api.put(`/orders/${orderId}/seller-action`, { action });
      toast.success(`Order ${action}ed ✓`);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    setActId(null);
  };

  const counts = orders.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a; }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Manage Orders</h1>
        <p className="text-gray-500 text-sm">{orders.length} orders</p>
      </div>

      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {ALL_TABS.map(s => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${tab===s?'bg-brand-500 text-white border-brand-500 shadow-orange':'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}>
            {SHORT[s]}{s !== 'all' && counts[s] ? ` (${counts[s]})` : ''}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : orders.length === 0 ? (
        <div className="card p-16 text-center">
          <Package size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-display font-bold text-lg text-gray-500">No orders found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const st = sCfg[order.status] || sCfg.pending;
            const img = order.product?.image ? (order.product.image.startsWith('http') ? order.product.image : `http://localhost:5000${order.product.image}`) : null;
            const isLoading = (k) => actId === order._id + k;

            return (
              <div key={order._id} className="card overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product info */}
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-orange-50 dark:bg-gray-700 overflow-hidden shrink-0">
                        {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-brand-300" /></div>}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{order.product?.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {order.quantity} · {formatDate(order.createdAt)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">👤 {order.buyer?.name} · {order.buyer?.email}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={10} />{order.distance} km</p>
                          {order.estimatedTime && <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} />{order.estimatedTime}</p>}
                        </div>
                      </div>
                    </div>
                    {/* Price + status */}
                    <div className="sm:text-right shrink-0">
                      <div className={`inline-flex items-center gap-1 mb-2 ${st.cls}`}>{st.icon}{st.label}</div>
                      {/* {order.status === 'pending' && order.acceptDeadline && (
                        <div className="mt-1 mb-1">
                          <Countdown deadline={order.acceptDeadline} />
                        </div>
                      )} */}
                      <div className="text-xs space-y-0.5 mt-1">
                        <p className="text-gray-500">Items: {formatCurrency(order.productPrice * order.quantity)}</p>
                        <p className="text-gray-500">Delivery: {order.deliveryCharge === 0 ? <span className="text-green-600">Free</span> : formatCurrency(order.deliveryCharge)}</p>
                        <p className="font-bold text-brand-600 text-sm">{formatCurrency(order.totalPrice)}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${order.paymentMethod==='razorpay'?'bg-blue-50 text-blue-700':'bg-gray-100 text-gray-600'}`}>
                          {order.paymentMethod==='razorpay'?'💳 Online':'💵 COD'}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${order.paymentStatus==='paid'?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {order.notes && <div className="mt-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-600 dark:text-gray-300">📝 {order.notes}</div>}

                  {/* Tracking timeline mini */}
                  {order.timeline?.length > 0 && (
                    <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1">
                      {order.timeline.map((ev, i) => (
                        <div key={i} className="flex items-center gap-1 shrink-0">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 bg-brand-500 rounded-full" />
                            <p className="text-xs text-gray-400 mt-1 capitalize whitespace-nowrap">{ev.status?.replace(/_/g,' ')}</p>
                          </div>
                          {i < order.timeline.length - 1 && <div className="w-6 h-0.5 bg-gray-200 dark:bg-gray-600 shrink-0 mb-4" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="border-t border-gray-50 dark:border-gray-700 px-5 py-3 bg-gray-50/50 dark:bg-gray-700/20">
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => doAction(order._id, 'accept')} disabled={!!actId}
                        className="flex-1 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold text-sm py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all">
                        {isLoading('accept') ? <Loader size={13} className="animate-spin" /> : <CheckCircle size={14} />} Accept
                      </button>
                      <button onClick={() => doAction(order._id, 'reject')} disabled={!!actId}
                        className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold text-sm py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all">
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                  {/* {order.status === 'seller_accepted' && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 py-1"><Clock size={13} />Waiting for buyer to confirm...</p>
                  )} */}
                {(order.status === 'seller_accepted' || order.status === 'buyer_confirmed') && (
  <button
    onClick={() => doAction(order._id, 'pack')}
    disabled={!!actId}
    className="w-full sm:w-auto bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm py-2 px-5 rounded-xl flex items-center justify-center gap-2 transition-all"
  >
    {isLoading('pack') ? (
      <Loader size={13} className="animate-spin" />
    ) : (
      <Box size={14} />
    )}
    Mark as Packed
  </button>
)}
                  {order.status === 'packed' && (
                    <button onClick={() => doAction(order._id, 'dispatch')} disabled={!!actId}
                      className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm py-2 px-5 rounded-xl flex items-center justify-center gap-2 transition-all">
                      {isLoading('dispatch') ? <Loader size={13} className="animate-spin" /> : <Send size={14} />} Out for Delivery
                    </button>
                  )}
                  {order.status === 'dispatched' && (
                    <button onClick={() => doAction(order._id, 'deliver')} disabled={!!actId}
                      className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold text-sm py-2 px-5 rounded-xl flex items-center justify-center gap-2 transition-all">
                      {isLoading('deliver') ? <Loader size={13} className="animate-spin" /> : <Truck size={14} />} Mark Delivered
                    </button>
                  )}
                  {order.status === 'expired' && (
                    <p className="text-xs text-gray-400 py-1">⏰ This order expired — seller did not respond in time.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
