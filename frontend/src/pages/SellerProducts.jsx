import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Zap, Package, Truck, ToggleLeft, ToggleRight, Loader, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { PageLoader } from '../components/Spinner';
import toast from 'react-hot-toast';

const StockBadge = ({ stock }) => {
  if (stock === 0) return <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">Out of Stock</span>;
  if (stock <= 9)  return <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle size={10}/>Low ({stock})</span>;
  return <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">In Stock ({stock})</span>;
};

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actId, setActId]       = useState(null);

  const fetch = () => {
    setLoading(true);
    api.get('/products/seller/my')
      .then(r => setProducts(r.data.products))
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    setActId(id);
    try { await api.delete(`/products/${id}`); toast.success('Deleted'); setProducts(p => p.filter(x => x._id !== id)); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActId(null);
  };

  const boost = async (id) => {
    setActId(id + 'b');
    try { await api.post(`/products/${id}/boost`); toast.success('Boosted 24h! ⚡'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot boost'); }
    setActId(null);
  };

  const toggleActive = async (p) => {
    setActId(p._id + 'a');
    try { await api.put(`/products/${p._id}`, { isActive: !p.isActive }); toast.success(`${p.isActive ? 'Deactivated' : 'Activated'}`); fetch(); }
    catch { toast.error('Failed'); }
    setActId(null);
  };

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock > 9).length,
    lowStock: products.filter(p => p.stock > 0 && p.stock <= 9).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">My Products</h1>
          <p className="text-gray-500 text-sm">{products.length} products</p>
        </div>
        <Link to="/seller/products/add" className="btn-primary flex items-center gap-2"><Plus size={16}/>Add Product</Link>
      </div>

      {/* Stock summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label:'Total',        val:stats.total,      bg:'bg-gray-50 dark:bg-gray-800',    text:'text-gray-700 dark:text-gray-200' },
          { label:'In Stock',     val:stats.inStock,    bg:'bg-green-50 dark:bg-green-900/20', text:'text-green-700 dark:text-green-300' },
          { label:'Low Stock',    val:stats.lowStock,   bg:'bg-amber-50 dark:bg-amber-900/20', text:'text-amber-700 dark:text-amber-300' },
          { label:'Out of Stock', val:stats.outOfStock, bg:'bg-red-50 dark:bg-red-900/20',   text:'text-red-700 dark:text-red-300' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center border border-gray-100 dark:border-gray-700`}>
            <p className={`font-bold text-xl ${s.text}`}>{s.val}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="card p-16 text-center">
          <Package size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl text-gray-600 mb-2">No products yet</h3>
          <Link to="/seller/products/add" className="btn-primary inline-flex items-center gap-2"><Plus size={16}/>Add First Product</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => {
            const img = p.image ? (p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`) : null;
            const isBoosted = p.isBoosted && p.boostExpiry && new Date() < new Date(p.boostExpiry);
            const hasDiscount = p.mrpPrice && p.mrpPrice > p.price;
            const discPct = hasDiscount ? Math.round(((p.mrpPrice-p.price)/p.mrpPrice)*100) : 0;

            return (
              <div key={p._id} className={`card p-4 flex gap-4 items-center ${!p.isActive?'opacity-60':''}`}>
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 dark:bg-gray-700 shrink-0">
                  {img ? <img src={img} alt={p.name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-brand-300"/></div>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{p.name}</h3>
                    {isBoosted && <span className="bg-brand-100 text-brand-600 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Zap size={10}/>Boosted</span>}
                    {p.freeDelivery && <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Truck size={10}/>Free</span>}
                    {hasDiscount && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">{discPct}% off</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-brand-600 text-sm">{formatCurrency(p.price)}</span>
                    {hasDiscount && <span className="line-through text-gray-400 text-xs">{formatCurrency(p.mrpPrice)}</span>}
                    <span className="text-xs text-gray-400">{p.category}</span>
                    <span className="text-xs text-gray-400">📍 {p.deliveryRadius||10}km radius</span>
                    <span className="text-xs text-gray-400">⭐ {p.avgRating||0} ({p.totalRatings})</span>
                  </div>
                  <div className="mt-1"><StockBadge stock={p.stock}/></div>
                  <p className="text-xs text-gray-300 mt-0.5">{formatDate(p.createdAt)}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleActive(p)} disabled={actId===p._id+'a'} title={p.isActive?'Deactivate':'Activate'} className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors">
                    {p.isActive ? <ToggleRight size={22} className="text-green-500"/> : <ToggleLeft size={22}/>}
                  </button>
                  <button onClick={() => boost(p._id)} disabled={!!actId || isBoosted} title="Boost 24h"
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${isBoosted?'bg-brand-50 text-brand-300 cursor-not-allowed':'bg-brand-50 text-brand-600 hover:bg-brand-100'}`}>
                    {actId===p._id+'b'?<Loader size={12} className="animate-spin"/>:<Zap size={14}/>}
                  </button>
                  <button onClick={() => del(p._id)} disabled={actId===p._id} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
