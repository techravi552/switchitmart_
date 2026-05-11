import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Loader, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/Spinner';
import toast from 'react-hot-toast';

const STATUS_OPTS = ['open','in_progress','resolved'];
const stCls = { open:'status-pending', in_progress:'status-accepted', resolved:'status-delivered' };

export default function TicketDetail() {
  const { id }   = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply]   = useState('');
  const [sending, setSending] = useState(false);

  const fetchTicket = () => api.get(`/support/${id}`).then(r=>setTicket(r.data.ticket)).catch(()=>toast.error('Not found')).finally(()=>setLoading(false));
  useEffect(()=>{ fetchTicket(); },[id]);

  const sendReply = async e => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try { const r = await api.post(`/support/${id}/reply`,{message:reply.trim()}); setTicket(r.data.ticket); setReply(''); toast.success('Reply sent'); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    setSending(false);
  };

  const updateStatus = async status => {
    try { const r = await api.put(`/support/${id}/status`,{status}); setTicket(r.data.ticket); toast.success('Status updated'); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  if (loading) return <PageLoader/>;
  if (!ticket) return <div className="p-8 text-center text-gray-500">Ticket not found</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/support" className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft size={18} className="text-gray-500"/></Link>
        <div className="flex-1"><h1 className="font-display font-bold text-xl text-gray-900">{ticket.subject}</h1><p className="text-gray-500 text-sm">{ticket.category} · {formatDate(ticket.createdAt)}</p></div>
        <span className={`${stCls[ticket.status]} capitalize`}>{ticket.status.replace('_',' ')}</span>
      </div>

      {/* Admin status controls */}
      {user?.role === 'admin' && (
        <div className="card p-4 mb-5 flex items-center gap-3">
          <p className="text-sm font-medium text-gray-700">Update status:</p>
          <div className="flex gap-2">
            {STATUS_OPTS.map(s=>(
              <button key={s} onClick={()=>updateStatus(s)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${ticket.status===s?'bg-brand-500 text-white border-brand-500':'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{s.replace('_',' ')}</button>
            ))}
          </div>
        </div>
      )}

      {/* Original message */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">{ticket.user?.name?.[0]?.toUpperCase()}</span></div>
          <div><p className="text-sm font-semibold text-gray-900">{ticket.user?.name}</p><p className="text-xs text-gray-400">{ticket.userRole} · {formatDate(ticket.createdAt)}</p></div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{ticket.message}</p>
      </div>

      {/* Replies */}
      {ticket.replies.length > 0 && (
        <div className="space-y-3 mb-4">
          {ticket.replies.map(r=>(
            <div key={r._id} className={`card p-4 ${r.senderRole==='admin'?'border-l-4 border-brand-400':''}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${r.senderRole==='admin'?'bg-brand-500 text-white':'bg-gray-200 text-gray-600'}`}>{r.sender?.name?.[0]?.toUpperCase()}</div>
                <div><p className="text-xs font-semibold text-gray-800">{r.sender?.name} <span className="text-gray-400 capitalize">({r.senderRole})</span></p><p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p></div>
              </div>
              <p className="text-sm text-gray-700">{r.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
      {ticket.status !== 'resolved' && (
        <form onSubmit={sendReply} className="card p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Reply</label>
          <textarea className="input-field text-sm resize-none h-24 mb-3" placeholder="Write your reply..." value={reply} onChange={e=>setReply(e.target.value)}/>
          <button type="submit" disabled={sending||!reply.trim()} className="btn-primary text-sm flex items-center gap-2">
            {sending?<Loader size={14} className="animate-spin"/>:<Send size={14}/>} Send Reply
          </button>
        </form>
      )}
      {ticket.status === 'resolved' && <div className="card p-5 text-center text-green-700 bg-green-50 border border-green-200"><CheckCircle size={20} className="mx-auto mb-2"/><p className="font-semibold text-sm">This ticket is resolved</p></div>}
    </div>
  );
}
