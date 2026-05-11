import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, Package, Loader } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { timeAgo } from '../../utils/helpers';
import { PageLoader } from '../../components/Spinner';
import toast from 'react-hot-toast';

export default function ChatWindow() {
  const { chatId } = useParams();
  const { user }   = useAuth();
  const [chat, setChat]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchChat = async () => {
    try { const r = await api.get(`/chat/${chatId}`); setChat(r.data.chat); }
    catch { toast.error('Failed to load chat'); }
    setLoading(false);
  };

  useEffect(() => { fetchChat(); }, [chatId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat?.messages]);

  // Poll for new messages every 5s
  useEffect(() => {
    const t = setInterval(fetchChat, 5000);
    return () => clearInterval(t);
  }, [chatId]);

  const sendMessage = async e => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    try {
      await api.post(`/chat/${chatId}/message`, { content: msg.trim() });
      setMsg('');
      await fetchChat();
    } catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    setSending(false);
  };

  if (loading) return <PageLoader/>;
  if (!chat)   return <div className="p-8 text-center text-gray-500">Chat not found</div>;

  const uid   = user?._id;
  const other = user?.role === 'seller' ? chat.buyer : chat.seller;
  const otherName = user?.role === 'buyer' ? (chat.seller?.shopName||chat.seller?.name) : chat.buyer?.name;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 h-[calc(100vh-5rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
        <Link to="/chat" className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft size={18} className="text-gray-500"/></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">{otherName?.[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{otherName}</p>
          {chat.product && (
            <Link to={`/products/${chat.product._id}`} className="flex items-center gap-1 text-xs text-brand-600 hover:underline">
              <Package size={10}/>{chat.product.name}
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {chat.messages.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">No messages yet. Say hello! 👋</div>
        )}
        {chat.messages.map(m => {
          const isMe = m.sender?._id?.toString() === uid || m.sender?.toString() === uid;
          return (
            <div key={m._id} className={`flex ${isMe?'justify-end':'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe?'bg-brand-500 text-white rounded-br-sm':'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                <p>{m.content}</p>
                <p className={`text-xs mt-1 ${isMe?'text-brand-100':'text-gray-400'}`}>{timeAgo(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Type a message..." maxLength={500}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50 focus:bg-white text-sm"/>
        <button type="submit" disabled={sending||!msg.trim()} className="w-10 h-10 bg-brand-500 hover:bg-brand-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all">
          {sending?<Loader size={16} className="animate-spin"/>:<Send size={16}/>}
        </button>
      </form>
    </div>
  );
}
