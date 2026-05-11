import { useState, useEffect } from 'react';
import { Activity, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { adminApi } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/Spinner';
import toast from 'react-hot-toast';

const actionColors = {
  admin_login: 'bg-blue-100 text-blue-700',
  order_placed: 'bg-orange-100 text-orange-700',
  seller_accepted: 'bg-green-100 text-green-700',
  seller_rejected: 'bg-red-100 text-red-700',
  buyer_confirmed: 'bg-indigo-100 text-indigo-700',
  buyer_rejected: 'bg-orange-100 text-orange-700',
  order_delivered: 'bg-green-100 text-green-700',
  user_blocked: 'bg-red-100 text-red-700',
  user_activated: 'bg-green-100 text-green-700',
  user_deleted: 'bg-red-100 text-red-700',
  subscription_assigned: 'bg-yellow-100 text-yellow-700',
  bulk_notification_sent: 'bg-purple-100 text-purple-700',
  product_deleted: 'bg-red-100 text-red-700',
  product_hidden: 'bg-gray-100 text-gray-700',
};

export default function AdminActivityLogs() {
  const [logs, setLogs]   = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage]   = useState(1);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    adminApi.get(`/activity-logs?page=${page}&limit=25`)
      .then((r) => { setLogs(r.data.logs); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 flex items-center gap-2"><Activity size={24} className="text-brand-500" /> Activity Logs</h1>
          <p className="text-gray-500 text-sm">{total} log entries</p>
        </div>
        <button onClick={() => { setPage(1); fetch(); }} className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading ? <PageLoader /> : (
        <>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log._id} className="card px-4 py-3 flex items-start gap-3 hover:shadow-card-hover transition-all">
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    {log.entity && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{log.entity}</span>}
                  </div>
                  <p className="text-sm text-gray-700">{log.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>👤 {log.actorName} <span className="capitalize">({log.actorRole})</span></span>
                    <span>·</span>
                    <span>{formatDate(log.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
            {logs.length === 0 && <div className="card py-16 text-center text-gray-400">No activity logs yet</div>}
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
