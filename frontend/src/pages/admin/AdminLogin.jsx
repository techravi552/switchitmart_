import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader, MapPin } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [form, setForm]       = useState({ email: 'admin@localkart.com', password: 'admin123456' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/login', form);
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminUser',  JSON.stringify(res.data.user));
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const seedAdmin = async () => {
    try {
      const r = await axios.post('/api/admin/seed');
      toast.success(r.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Seed failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center shadow-orange">
              <Shield size={24} className="text-white" />
            </div>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">Admin Portal</h1>
          <p className="text-white/60 mt-1">LocalKart Control Panel</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
              <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader size={16} className="animate-spin" /> Signing in...</> : <><Shield size={16} /> Sign In as Admin</>}
            </button>
          </form>
          <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
            <p className="font-semibold mb-1">First time setup:</p>
            <button onClick={seedAdmin} className="underline hover:text-blue-900">Click to create default admin account</button>
            <p className="mt-1 text-blue-500">admin@localkart.com / admin123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
