import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Package, Truck, Clock, Megaphone, ShieldAlert, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency, timeAgo } from '../utils/helpers';

const typeIcon = {
  order_placed:    <Package size={15} className="text-brand-500"/>,
  order_accepted:  <CheckCircle size={15} className="text-green-500"/>,
  order_rejected:  <X size={15} className="text-red-500"/>,
  buyer_confirmed: <CheckCircle size={15} className="text-blue-500"/>,
  buyer_rejected:  <X size={15} className="text-orange-500"/>,
  order_delivered: <Truck size={15} className="text-green-600"/>,
  admin_message:   <Megaphone size={15} className="text-purple-500"/>,
  account_action:  <ShieldAlert size={15} className="text-red-500"/>,
};

export default function NotificationBell() {
  const [open, setOpen]     = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(null);
  const ref = useRef(null);

  const fetchCount = async () => {
    try { const r = await api.get('/notifications/unread-count'); setUnread(r.data.count); } catch {}
  };

  const fetchAll = async () => {
    setLoading(true);
    try { const r = await api.get('/notifications?limit=30'); setNotifs(r.data.notifications); setUnread(r.data.unread); } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchCount();
    const t = setInterval(fetchCount, 20000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { if (open) fetchAll(); }, [open]);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifs(n => n.map(x => ({ ...x, isRead: true })));
    setUnread(0);
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifs(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
    setUnread(u => Math.max(0, u - 1));
  };

  const respond = async (notifId, action) => {
    setActing(notifId + action);
    try {
      const r = await api.put(`/notifications/${notifId}/respond`, { action });
      toast.success(r.data.message);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    setActing(null);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Bell size={20} className={unread > 0 ? 'text-brand-600' : 'text-gray-500 dark:text-gray-400'}/>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-96 max-h-[70vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col z-50 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-brand-600"/>
              <h3 className="font-display font-bold text-gray-900 dark:text-white">Notifications</h3>
              {unread > 0 && <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">{unread}</span>}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-brand-600 hover:underline flex items-center gap-1 px-2 py-1 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg">
                  <CheckCheck size={12}/>All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={15} className="text-gray-400"/>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
            ) : notifs.length === 0 ? (
              <div className="p-10 text-center">
                <Bell size={36} className="text-gray-200 mx-auto mb-2"/>
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifs.map(n => (
                <div key={n._id}
                  className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${!n.isRead ? 'bg-brand-50/50 dark:bg-brand-900/10' : ''}`}
                  onClick={() => { if (!n.isRead) markRead(n._id); }}>
                  <div className="flex gap-3 items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${!n.isRead ? 'bg-brand-100 dark:bg-brand-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      {typeIcon[n.type] || <Bell size={14} className="text-gray-400"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold leading-snug ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{n.title}</p>
                        <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>

                      {/* Payment breakdown for accepted orders */}
                      {n.type === 'order_accepted' && n.data?.totalAmount && (
                        <div className="mt-2 p-2.5 bg-white dark:bg-gray-700 border border-green-100 dark:border-green-800 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between"><span className="text-gray-500">Items ×{n.data.quantity}</span><span className="font-medium">{formatCurrency(n.data.productPrice * (n.data.quantity||1))}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className={n.data.deliveryCharge===0?'text-green-600 font-medium':'font-medium'}>{n.data.deliveryCharge===0?'Free':formatCurrency(n.data.deliveryCharge)}</span></div>
                          <div className="flex justify-between border-t dark:border-gray-600 pt-1"><span className="font-bold text-gray-800 dark:text-white">Total</span><span className="font-bold text-brand-600">{formatCurrency(n.data.totalAmount)}</span></div>
                        </div>
                      )}

                      {/* Buyer action buttons */}
                      {n.requiresAction && !n.actionTaken && (
                        <div className="flex gap-2 mt-2">
                          <button disabled={!!acting} onClick={e => { e.stopPropagation(); respond(n._id, 'confirmed'); }}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1.5 rounded-lg transition-all disabled:opacity-60">
                            {acting === n._id + 'confirmed' ? '...' : '✅ Accept Order'}
                          </button>
                          <button disabled={!!acting} onClick={e => { e.stopPropagation(); respond(n._id, 'rejected'); }}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 rounded-lg transition-all disabled:opacity-60">
                            ❌ Reject
                          </button>
                        </div>
                      )}
                      {n.requiresAction && n.actionTaken && (
                        <div className={`mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${n.actionTaken==='confirmed'?'bg-green-50 text-green-700':'bg-red-50 text-red-600'}`}>
                          You {n.actionTaken} this order
                        </div>
                      )}
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0 mt-2"/>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
