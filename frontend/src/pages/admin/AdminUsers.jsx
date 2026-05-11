import { useState, useEffect } from 'react';
import { Search, UserX, UserCheck, Trash2, Shield, Store, ShoppingBag, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/Spinner';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(1);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole]     = useState('all');
  const [acting, setActing] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    adminApi.get(`/users?role=${role}&search=${search}&page=${page}&limit=15`)
      .then((r) => { setUsers(r.data.users); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { const t = setTimeout(fetchUsers, 300); return () => clearTimeout(t); }, [search, role, page]);

  const updateStatus = async (id, payload) => {
    setActing(id);
    try {
      await adminApi.put(`/users/${id}/status`, payload);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActing(null);
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setActing(id);
    try {
      await adminApi.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActing(null);
  };

  const roleIcon = { seller: <Store size={13} className="text-amber-500" />, buyer: <ShoppingBag size={13} className="text-blue-500" /> };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display font-bold text-2xl text-gray-900">User Management</h1><p className="text-gray-500 text-sm">{total} users total</p></div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-9 text-sm" placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all','seller','buyer'].map((r) => (
            <button key={r} onClick={() => { setRole(r); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${role === r ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? <PageLoader /> : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User','Role','Shop','Status','Joined','Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">{u.name[0].toUpperCase()}</span>
                        </div>
                        <div><p className="font-medium text-gray-900 text-xs">{u.name}</p><p className="text-gray-400 text-xs">{u.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs font-medium capitalize">{roleIcon[u.role]}{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">{u.shopName || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${u.isActive && !u.isBlocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.isBlocked ? 'Blocked' : u.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {u.subscription && <span className="text-xs text-gray-400 capitalize">{u.subscription.plan} plan</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!u.isBlocked ? (
                          <button onClick={() => updateStatus(u._id, { isBlocked: true })} disabled={acting === u._id} title="Block user"
                            className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
                            {acting === u._id ? <Loader size={14} className="animate-spin" /> : <UserX size={14} />}
                          </button>
                        ) : (
                          <button onClick={() => updateStatus(u._id, { isBlocked: false, isActive: true })} disabled={acting === u._id} title="Unblock"
                            className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-all">
                            <UserCheck size={14} />
                          </button>
                        )}
                        {u.isActive ? (
                          <button onClick={() => updateStatus(u._id, { isActive: false })} disabled={acting === u._id} title="Deactivate"
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-all text-xs font-medium">
                            Off
                          </button>
                        ) : (
                          <button onClick={() => updateStatus(u._id, { isActive: true })} disabled={acting === u._id} title="Activate"
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all text-xs font-medium">
                            On
                          </button>
                        )}
                        <button onClick={() => deleteUser(u._id, u.name)} disabled={acting === u._id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="py-12 text-center text-gray-400">No users found</div>}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={() => setPage((p) => Math.max(1,p-1))} disabled={page===1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600">Page {page} of {pages}</span>
              <button onClick={() => setPage((p) => Math.min(pages,p+1))} disabled={page===pages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
