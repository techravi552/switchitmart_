import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/Spinner';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ALL_STATUSES = ['all','pending','seller_accepted','seller_rejected','buyer_confirmed','buyer_rejected','delivered'];
const statusCls = { pending:'status-pending', seller_accepted:'status-accepted', seller_rejected:'status-rejected', buyer_confirmed:'bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-2.5 py-1 rounded-full', buyer_rejected:'bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold px-2.5 py-1 rounded-full', delivered:'status-delivered' };
const statusLabel = { pending:'Pending', seller_accepted:'Seller Accepted', seller_rejected:'Seller Rejected', buyer_confirmed:'Buyer Confirmed', buyer_rejected:'Buyer Rejected', delivered:'Delivered' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminApi.get(`/orders?status=${status}&page=${page}&limit=15`)
      .then((r) => { setOrders(r.data.orders); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [status, page]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6"><h1 className="font-display font-bold text-2xl text-gray-900">Order Management</h1><p className="text-gray-500 text-sm">{total} orders</p></div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border capitalize ${status === s ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
            {s === 'all' ? 'All' : statusLabel[s]}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Order','Buyer','Seller','Product','Amount','Status','Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => {
                  const img = o.product?.image ? (o.product.image.startsWith('http') ? o.product.image : `http://localhost:5000${o.product.image}`) : null;
                  return (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">#{o._id.slice(-6).toUpperCase()}</td>
                      <td className="px-4 py-3 text-xs"><p className="font-medium text-gray-800">{o.buyer?.name}</p><p className="text-gray-400">{o.buyer?.email}</p></td>
                      <td className="px-4 py-3 text-xs text-gray-600">{o.seller?.shopName || o.seller?.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 overflow-hidden shrink-0">
                            {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Package size={12} className="text-brand-300 m-auto mt-2" />}
                          </div>
                          <span className="text-xs text-gray-700 max-w-[100px] truncate">{o.product?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-brand-600 text-xs">{formatCurrency(o.totalPrice)}</td>
                      <td className="px-4 py-3"><span className={statusCls[o.status] || 'status-pending'}>{statusLabel[o.status] || o.status}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(o.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {orders.length === 0 && <div className="py-12 text-center text-gray-400">No orders found</div>}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => setPage((p)=>Math.max(1,p-1))} disabled={page===1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <span className="text-sm text-gray-600">Page {page} of {pages}</span>
              <button onClick={() => setPage((p)=>Math.min(pages,p+1))} disabled={page===pages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
