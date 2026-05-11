import { useState, useEffect } from 'react';
import { Search, Eye, EyeOff, Trash2, Package, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/Spinner';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState(null);

  const fetch = () => {
    setLoading(true);
    adminApi.get(`/products?search=${search}&page=${page}&limit=15`)
      .then((r) => { setProducts(r.data.products); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { const t = setTimeout(fetch, 300); return () => clearTimeout(t); }, [search, page]);

  const toggle = async (id) => {
    setActing(id);
    try { await adminApi.put(`/products/${id}/toggle`); toast.success('Updated'); fetch(); }
    catch { toast.error('Failed'); }
    setActing(null);
  };

  const del = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;
    setActing(id);
    try { await adminApi.delete(`/products/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
    setActing(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display font-bold text-2xl text-gray-900">Product Management</h1><p className="text-gray-500 text-sm">{total} products</p></div>
      </div>
      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input-field pl-9 text-sm" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? <PageLoader /> : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Product','Seller','Price','Stock','Rating','Status','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => {
                  const img = p.image ? (p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`) : null;
                  return (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-orange-50 overflow-hidden shrink-0">
                            {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-brand-300" /></div>}
                          </div>
                          <div><p className="font-medium text-gray-900 text-xs max-w-[140px] truncate">{p.name}</p><p className="text-xs text-gray-400">{p.category}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{p.seller?.shopName || p.seller?.name}<br/><span className="text-gray-400">{p.seller?.email}</span></td>
                      <td className="px-4 py-3 font-semibold text-brand-600 text-xs">{formatCurrency(p.price)}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{p.stock}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">⭐ {p.avgRating || 0} ({p.totalRatings})</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggle(p._id)} disabled={acting === p._id} title={p.isActive ? 'Hide' : 'Show'}
                            className={`p-1.5 rounded-lg transition-all ${p.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}>
                            {acting === p._id ? <Loader size={14} className="animate-spin" /> : p.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button onClick={() => del(p._id, p.name)} disabled={acting === p._id}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {products.length === 0 && <div className="py-12 text-center text-gray-400">No products found</div>}
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
