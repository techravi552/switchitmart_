import { useState, useEffect } from 'react';
import { adminApi } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/Spinner';
import { CreditCard, ChevronLeft, ChevronRight, Star, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = ['normal', 'silver', 'gold'];
const planCls = { gold: 'badge-gold', silver: 'badge-silver', normal: 'badge-normal' };

export default function AdminSubscriptions() {
  const [subs, setSubs]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [page, setPage]     = useState(1);
  const [plan, setPlan]     = useState('all');
  const [planStats, setPlanStats] = useState([]);
  const [loading, setLoading] = useState(true);
  // Assign modal
  const [showAssign, setShowAssign] = useState(false);
  const [sellerId, setSellerId] = useState('');
  const [assignPlan, setAssignPlan] = useState('silver');
  const [assigning, setAssigning] = useState(false);

  const fetch = () => {
    setLoading(true);
    adminApi.get(`/subscriptions?plan=${plan}&page=${page}&limit=15`)
      .then((r) => { setSubs(r.data.subscriptions); setTotal(r.data.total); setPages(r.data.pages); setPlanStats(r.data.planStats); })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [plan, page]);

  const assign = async () => {
    if (!sellerId.trim()) return toast.error('Enter a seller ID');
    setAssigning(true);
    try {
      const r = await adminApi.post('/subscriptions/assign', { sellerId: sellerId.trim(), plan: assignPlan });
      toast.success(r.data.message);
      setShowAssign(false); setSellerId('');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setAssigning(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display font-bold text-2xl text-gray-900">Subscription Management</h1><p className="text-gray-500 text-sm">{total} subscriptions</p></div>
        <button onClick={() => setShowAssign(!showAssign)} className="btn-primary text-sm flex items-center gap-2"><CreditCard size={15} /> Assign Plan</button>
      </div>

      {/* Plan stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {planStats.map((s) => (
          <div key={s._id} className="card p-4 text-center">
            <span className={`inline-block mb-1 capitalize ${planCls[s._id] || 'badge-normal'}`}>{s._id}</span>
            <p className="font-bold text-gray-900 text-xl">{s.count}</p>
            <p className="text-xs text-gray-400">{s.active} active</p>
          </div>
        ))}
      </div>

      {/* Assign plan */}
      {showAssign && (
        <div className="card p-5 mb-5 border-2 border-brand-200 animate-slide-up">
          <h3 className="font-semibold text-gray-800 mb-3">Assign Subscription to Seller</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input className="input-field flex-1 text-sm" placeholder="Seller User ID (MongoDB _id)" value={sellerId} onChange={(e) => setSellerId(e.target.value)} />
            <select className="input-field sm:w-36 text-sm" value={assignPlan} onChange={(e) => setAssignPlan(e.target.value)}>
              {PLANS.map((p) => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
            </select>
            <button onClick={assign} disabled={assigning} className="btn-primary text-sm flex items-center gap-2 shrink-0">
              {assigning ? <Loader size={14} className="animate-spin" /> : null} Assign
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {['all', ...PLANS].map((p) => (
          <button key={p} onClick={() => { setPlan(p); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${plan === p ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
            {p}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Seller','Plan','Products Used','Start','Expiry','Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subs.map((s) => {
                  const expired = new Date() > new Date(s.expiryDate);
                  return (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs"><p className="font-medium text-gray-800">{s.seller?.shopName || s.seller?.name}</p><p className="text-gray-400">{s.seller?.email}</p></td>
                      <td className="px-4 py-3"><span className={`capitalize ${planCls[s.plan] || 'badge-normal'}`}>{s.plan}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-600">{s.productsUsed} / {{'normal':5,'silver':20,'gold':50}[s.plan]}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(s.startDate)}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(s.expiryDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${expired ? 'bg-red-100 text-red-600' : s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {expired ? 'Expired' : s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {subs.length === 0 && <div className="py-12 text-center text-gray-400">No subscriptions found</div>}
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
