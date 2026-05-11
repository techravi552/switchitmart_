import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/Spinner';
import toast from 'react-hot-toast';

const stCls = { open:'status-pending', in_progress:'status-accepted', resolved:'status-delivered' };

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchTickets = () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    axios.get('/api/support/all', {
      headers: { Authorization: `Bearer ${token}` },
      params: { status, page, limit: 15 },
    })
      .then(r => { setTickets(r.data.tickets); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, [status, page]);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900 flex items-center gap-2">
          <LifeBuoy size={24} className="text-brand-500" /> Support Tickets
        </h1>
        <p className="text-gray-500 text-sm">{total} tickets</p>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {['all','open','in_progress','resolved'].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${status === s ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : (
        <>
          <div className="space-y-3">
            {tickets.map(t => (
              <Link key={t._id} to={`/support/${t._id}`} className="card-hover p-5 flex items-center gap-4 block">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.priority === 'high' ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <LifeBuoy size={18} className={t.priority === 'high' ? 'text-red-500' : 'text-brand-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm truncate">{t.subject}</p>
                    <span className={`${stCls[t.status] || 'status-pending'} capitalize shrink-0`}>{t.status.replace('_', ' ')}</span>
                    {t.priority === 'high' && <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0">High</span>}
                  </div>
                  <p className="text-xs text-gray-500">
                    👤 {t.user?.name} ({t.userRole}) · {t.category} · {t.replies?.length || 0} replies · {formatDate(t.createdAt)}
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-300 shrink-0" />
              </Link>
            ))}
            {tickets.length === 0 && <div className="card py-12 text-center text-gray-400">No tickets found</div>}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <span className="text-sm text-gray-600">Page {page} of {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
