import { useState, useEffect } from 'react';
import { Package, MapPin, Clock, CheckCircle, XCircle, Truck, ChevronDown, ChevronUp, Box, Send } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { PageLoader } from '../components/Spinner';
import toast from 'react-hot-toast';

const ALL_TABS = ['all','pending','seller_accepted','buyer_confirmed','packed','dispatched','delivered','seller_rejected','buyer_rejected','expired'];

const sCfg = {
  pending:         { label:'Waiting for Seller',  cls:'status-pending',   emoji:'⏳' },
  seller_accepted: { label:'Seller Accepted',     cls:'status-accepted',  emoji:'✅' },
  seller_rejected: { label:'Seller Rejected',     cls:'status-rejected',  emoji:'❌' },
  buyer_confirmed: { label:'You Confirmed',       cls:'status-accepted',  emoji:'🎉' },
  buyer_rejected:  { label:'You Rejected',        cls:'status-rejected',  emoji:'↩️' },
  packed:          { label:'Being Packed',        cls:'bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-full', emoji:'📦' },
  dispatched:      { label:'Out for Delivery',   cls:'bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full', emoji:'🚴' },
  delivered:       { label:'Delivered',           cls:'status-delivered', emoji:'🎊' },
  expired:         { label:'Expired',             cls:'bg-gray-100 text-gray-500 border border-gray-200 text-xs font-semibold px-2.5 py-1 rounded-full', emoji:'⏰' },
};

const SHORT = { all:'All', pending:'Pending', seller_accepted:'Accepted', seller_rejected:'Rejected', buyer_confirmed:'Confirmed', buyer_rejected:'Cancelled', packed:'Packed', dispatched:'On Way', delivered:'Delivered', expired:'Expired' };

// Tracking progress bar steps
const STEPS = ['pending','seller_accepted','buyer_confirmed','packed','dispatched','delivered'];
const STEP_LABELS = { pending:'Placed', seller_accepted:'Accepted', buyer_confirmed:'Confirmed', packed:'Packed', dispatched:'On Way', delivered:'Delivered' };

function TrackingBar({ status }) {
  const idx = STEPS.indexOf(status);
  const done = idx === -1 ? -1 : idx;
  if (['seller_rejected','buyer_rejected','expired'].includes(status)) {
    return <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl text-xs text-red-600 font-medium text-center">Order {sCfg[status]?.label}</div>;
  }
  return (
    <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-700">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-600 z-0" />
        <div className="absolute top-3 left-0 h-0.5 bg-brand-500 z-10 transition-all duration-500"
          style={{ width: done <= 0 ? '0%' : `${(done / (STEPS.length - 1)) * 100}%` }} />
        {STEPS.map((step, i) => (
          <div key={step} className="flex flex-col items-center z-20 relative">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
              i <= done ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
            }`}>
              {i < done ? <CheckCircle size={14} /> : <span className="text-xs font-bold">{i+1}</span>}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block whitespace-nowrap">{STEP_LABELS[step]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    setLoading(true);
    api.get('/orders/my')
      .then(r => setOrders(r.data.orders))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === 'all' ? orders : orders.filter(o => o.status === tab);
  const counts = orders.reduce((a, o) => { a[o.status] = (a[o.status] || 0) + 1; return a; }, {});
  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">My Orders</h1>
        <p className="text-gray-500 text-sm">{orders.length} total orders</p>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-5">
        {['pending','buyer_confirmed','dispatched','delivered','expired'].map(s => (
          <div key={s} onClick={() => setTab(s)} className={`card p-2 text-center cursor-pointer hover:-translate-y-0.5 transition-all ${tab===s?'ring-2 ring-brand-400':''}`}>
            <p className="text-xl">{sCfg[s]?.emoji}</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{counts[s]||0}</p>
            <p className="text-xs text-gray-400 truncate">{SHORT[s]}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {ALL_TABS.map(s => (
          <button key={s} onClick={() => setTab(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${tab===s?'bg-brand-500 text-white border-brand-500':'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'}`}>
            {SHORT[s]}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Package size={48} className="text-gray-200 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-gray-500">No orders here</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const st = sCfg[order.status] || sCfg.pending;
            const img = order.product?.image ? (order.product.image.startsWith('http') ? order.product.image : `http://localhost:5000${order.product.image}`) : null;
            const isExp = expanded[order._id];
            const hasMrpDiscount = order.mrpPrice && order.mrpPrice > order.productPrice;

            return (
              <div key={order._id} className="card animate-slide-up overflow-hidden">
                <div className="p-5">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 dark:bg-gray-700 shrink-0">
                      {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-brand-300" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{order.product?.name}</h3>
                        <span className={`${st.cls} shrink-0`}>{st.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">From: <span className="font-medium text-gray-700 dark:text-gray-300">{order.seller?.shopName||order.seller?.name}</span></p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10}/>{order.distance} km
                        {order.estimatedTime && <><span className="mx-1">·</span><Clock size={10}/>{order.estimatedTime}</>}
                      </p>
                      <p className="text-xs text-gray-300 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  {/* Tracking bar */}
                  <TrackingBar status={order.status} />

                  {/* Price breakdown */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <p className="text-gray-400 mb-0.5">Items ×{order.quantity}</p>
                      <p className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(order.productPrice * order.quantity)}</p>
                      {hasMrpDiscount && <p className="line-through text-gray-400">{formatCurrency(order.mrpPrice * order.quantity)}</p>}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <p className="text-gray-400 mb-0.5">Delivery</p>
                      <p className={`font-semibold ${order.deliveryCharge===0?'text-green-600':''}`}>{order.deliveryCharge===0?'Free':formatCurrency(order.deliveryCharge)}</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
                      <p className="text-gray-400 mb-0.5">Total</p>
                      <p className="font-bold text-brand-600">{formatCurrency(order.totalPrice)}</p>
                      {order.savings > 0 && <p className="text-green-600">Saved {formatCurrency(order.savings)}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.paymentMethod==='razorpay'?'bg-blue-50 text-blue-700':'bg-gray-100 text-gray-600'}`}>
                      {order.paymentMethod==='razorpay'?'💳 Online':'💵 COD'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.paymentStatus==='paid'?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>

                  {order.status === 'seller_accepted' && (
                    <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                      <Clock size={12}/>Check notifications to confirm or reject this order.
                    </div>
                  )}
                  {order.notes && <p className="mt-2 text-xs text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">📝 {order.notes}</p>}
                </div>

                {/* Timeline expandable */}
                {order.timeline?.length > 0 && (
                  <div className="border-t border-gray-50 dark:border-gray-700">
                    <button onClick={() => toggle(order._id)} className="w-full flex items-center justify-center gap-1 py-2 text-xs text-brand-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      {isExp ? <><ChevronUp size={13}/>Hide Timeline</> : <><ChevronDown size={13}/>Order Timeline ({order.timeline.length} events)</>}
                    </button>
                    {isExp && (
                      <div className="px-5 pb-4 space-y-3 bg-gray-50/50 dark:bg-gray-700/20">
                        {order.timeline.map((ev, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${i===order.timeline.length-1?'bg-brand-500':'bg-gray-300'}`}/>
                              {i < order.timeline.length-1 && <div className="w-0.5 bg-gray-200 dark:bg-gray-600 h-6 mt-1"/>}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 capitalize">{ev.status?.replace(/_/g,' ')}</p>
                              {ev.message && <p className="text-xs text-gray-500">{ev.message}</p>}
                              <p className="text-xs text-gray-400">{formatDate(ev.timestamp)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
