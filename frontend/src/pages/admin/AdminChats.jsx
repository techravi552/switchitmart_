import { useState, useEffect } from 'react';
import { MessageCircle, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { timeAgo } from '../../utils/helpers';
import { PageLoader } from '../../components/Spinner';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminChats() {
  const [chats, setChats]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    // Admin views all chats via the chat endpoint with admin token
    axios.get('/api/chat', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setChats(r.data.chats || []))
      .catch(() => toast.error('Failed to load chats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900 flex items-center gap-2">
          <MessageCircle size={24} className="text-brand-500" /> All Chats
        </h1>
        <p className="text-gray-500 text-sm">{chats.length} conversations</p>
      </div>

      {loading ? <PageLoader /> : chats.length === 0 ? (
        <div className="card py-16 text-center text-gray-400">
          <MessageCircle size={40} className="mx-auto mb-3 text-gray-200" />
          <p>No chat conversations yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map(chat => (
            <div key={chat._id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center shrink-0">
                <MessageCircle size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {chat.buyer?.name} ↔ {chat.seller?.shopName || chat.seller?.name}
                  </p>
                  <span className="text-xs text-gray-400 shrink-0">{timeAgo(chat.lastMessageAt)}</span>
                </div>
                {chat.product && <p className="text-xs text-brand-600">Re: {chat.product.name}</p>}
                <p className="text-xs text-gray-500 truncate">{chat.lastMessage || 'No messages'}</p>
                <p className="text-xs text-gray-400 mt-0.5">{chat.messages?.length || 0} messages total</p>
              </div>
              <div className="text-xs text-gray-400 shrink-0 text-right">
                <p>{chat.buyerUnread + chat.sellerUnread} unread</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
