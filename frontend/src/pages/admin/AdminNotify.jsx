import { useState } from 'react';
import { Bell, Loader, Send } from 'lucide-react';
import { adminApi } from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminNotify() {
  const [form, setForm] = useState({ targetRole: 'all', targetUserId: '', title: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) return toast.error('Title and message required');
    setLoading(true);
    try {
      const payload = { title: form.title, message: form.message };
      if (form.targetUserId.trim()) {
        payload.targetUserId = form.targetUserId.trim();
      } else {
        payload.targetRole = form.targetRole;
      }
      const r = await adminApi.post('/notify', payload);
      toast.success(r.data.message);
      setForm({ targetRole: 'all', targetUserId: '', title: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Send Notification</h1>
        <p className="text-gray-500 text-sm mt-0.5">Broadcast messages to users on the platform</p>
      </div>

      <div className="card p-6 space-y-5">
        <form onSubmit={handleSend} className="space-y-4">
          {/* Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Audience</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['all','seller','buyer'].map((r) => (
                <button key={r} type="button" onClick={() => setForm({...form, targetRole: r, targetUserId: ''})}
                  className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all border ${form.targetRole === r && !form.targetUserId ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                  {r === 'all' ? '👥 All Users' : r === 'seller' ? '🏪 Sellers' : '🛒 Buyers'}
                </button>
              ))}
            </div>
            <div className="relative">
              <input className="input-field text-sm" placeholder="OR enter specific User ID to target one person"
                value={form.targetUserId} onChange={(e) => setForm({...form, targetUserId: e.target.value})} />
            </div>
            {form.targetUserId && <p className="text-xs text-brand-600 mt-1">⚠️ Targeting specific user. Role filter ignored.</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notification Title *</label>
            <input className="input-field text-sm" placeholder="e.g. 🎉 Special Offer Today!" maxLength={100}
              value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
            <p className="text-xs text-gray-400 mt-1">{form.title.length}/100</p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
            <textarea className="input-field text-sm resize-none h-28" placeholder="Write your notification message..." maxLength={500}
              value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} />
            <p className="text-xs text-gray-400 mt-1">{form.message.length}/500</p>
          </div>

          {/* Preview */}
          {(form.title || form.message) && (
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl">
              <p className="text-xs font-semibold text-brand-700 mb-2 flex items-center gap-1"><Bell size={12} /> Preview</p>
              <p className="text-sm font-semibold text-gray-900">{form.title || '(title)'}</p>
              <p className="text-xs text-gray-600 mt-1">{form.message || '(message)'}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> Send Notification</>}
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h3 className="text-sm font-semibold text-blue-800 mb-1">📋 Notes</h3>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Notifications appear in the bell icon for each user</li>
          <li>• "All Users" sends to both sellers and buyers</li>
          <li>• To target one user, enter their MongoDB User ID</li>
        </ul>
      </div>
    </div>
  );
}
