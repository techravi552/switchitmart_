import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Store, ShoppingBag } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { timeAgo } from '../../utils/helpers';
import { PageLoader } from '../../components/Spinner';

export default function ChatList() {
  const { user } = useAuth();
  const [chats, setChats]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/chat').then(r=>setChats(r.data.chats)).catch(console.error).finally(()=>setLoading(false));
  }, []);

  if (loading) return <PageLoader/>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <MessageCircle size={24} className="text-brand-500"/>
        <div><h1 className="font-display font-bold text-2xl text-gray-900">Messages</h1><p className="text-gray-500 text-sm">{chats.length} conversations</p></div>
      </div>

      {chats.length === 0 ? (
        <div className="card p-16 text-center">
          <MessageCircle size={48} className="text-gray-200 mx-auto mb-4"/>
          <h3 className="font-display font-bold text-lg text-gray-500">No messages yet</h3>
          <p className="text-gray-400 text-sm mt-1">{user?.role==='buyer'?'Browse products and chat with sellers':'Buyers will message you here'}</p>
          {user?.role==='buyer'&&<Link to="/products" className="btn-primary mt-4 inline-flex">Browse Products</Link>}
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map(chat=>{
            const other = user?.role==='seller' ? chat.buyer : chat.seller;
            const unread = user?.role==='seller' ? chat.sellerUnread : chat.buyerUnread;
            return (
              <Link key={chat._id} to={`/chat/${chat._id}`} className="card-hover flex items-center gap-4 p-4 block">
                <div className="w-11 h-11 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">{other?.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-semibold text-gray-900 text-sm">{user?.role==='buyer'?(other?.shopName||other?.name):other?.name}</p>
                    <span className="text-xs text-gray-400">{timeAgo(chat.lastMessageAt)}</span>
                  </div>
                  {chat.product && <p className="text-xs text-brand-600 mb-0.5">Re: {chat.product.name}</p>}
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage||'No messages yet'}</p>
                </div>
                {unread > 0 && <span className="w-5 h-5 bg-brand-500 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">{unread}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
