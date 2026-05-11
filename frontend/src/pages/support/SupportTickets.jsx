import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, Plus, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/Spinner';
import toast from 'react-hot-toast';

const STATUS = { open:{cls:'status-pending',icon:<Clock size={12}/>}, in_progress:{cls:'status-accepted',icon:<AlertCircle size={12}/>}, resolved:{cls:'status-delivered',icon:<CheckCircle size={12}/>} };
const CATEGORIES = ['order','payment','product','account','other'];

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject:'', message:'', category:'other', priority:'medium' });

  useEffect(() => { api.get('/support/my').then(r=>setTickets(r.data.tickets)).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  const submit = async e => {
    e.preventDefault();
    if (!form.subject||!form.message) return toast.error('Subject and message required');
    setSubmitting(true);
    try {
      const r = await api.post('/support', form);
      setTickets(t=>[r.data.ticket,...t]);
      setShowForm(false);
      setForm({subject:'',message:'',category:'other',priority:'medium'});
      toast.success('Ticket submitted!');
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    setSubmitting(false);
  };

  if (loading) return <PageLoader/>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><LifeBuoy size={24} className="text-brand-500"/><div><h1 className="font-display font-bold text-2xl text-gray-900">Support</h1><p className="text-gray-500 text-sm">{tickets.length} tickets</p></div></div>
        <button onClick={()=>setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus size={16}/>New Ticket</button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 border-2 border-brand-200 animate-slide-up">
          <h3 className="font-semibold text-gray-800 mb-4">Create Support Ticket</h3>
          <form onSubmit={submit} className="space-y-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label><input className="input-field text-sm" placeholder="Brief description of your issue" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="input-field text-sm" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                  {CATEGORIES.map(c=><option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select className="input-field text-sm" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                  {['low','medium','high'].map(p=><option key={p} value={p} className="capitalize">{p}</option>)}
                </select>
              </div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Message *</label><textarea className="input-field text-sm resize-none h-28" placeholder="Describe your issue in detail..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/></div>
            <div className="flex gap-2"><button type="button" onClick={()=>setShowForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button><button type="submit" disabled={submitting} className="btn-primary flex-1 text-sm">{submitting?'Submitting...':'Submit Ticket'}</button></div>
          </form>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="card p-16 text-center"><LifeBuoy size={48} className="text-gray-200 mx-auto mb-4"/><h3 className="font-display font-bold text-lg text-gray-500">No tickets yet</h3><p className="text-gray-400 text-sm">Create a ticket if you need help</p></div>
      ) : (
        <div className="space-y-3">
          {tickets.map(t => (
            <Link key={t._id} to={`/support/${t._id}`} className="card-hover p-5 flex items-center gap-4 block">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.priority==='high'?'bg-red-50':t.priority==='medium'?'bg-amber-50':'bg-gray-50'}`}>
                <LifeBuoy size={18} className={t.priority==='high'?'text-red-500':'text-brand-400'}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1"><p className="font-semibold text-gray-900 text-sm truncate">{t.subject}</p><span className={`${STATUS[t.status]?.cls} flex items-center gap-1 shrink-0`}>{STATUS[t.status]?.icon} {t.status.replace('_',' ')}</span></div>
                <p className="text-xs text-gray-500">Category: {t.category} · {t.replies.length} replies · {formatDate(t.createdAt)}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0"/>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
