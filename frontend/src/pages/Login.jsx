import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import logo1 from '../assets/logo/logo-light.png';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      navigate(user.role === 'seller' ? '/seller/dashboard' : '/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              {/* <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-orange">
                <MapPin size={20} className="text-white" />
              </div> */}


              <img src={logo1} className="w-9 h-6" alt="" />
              <span className="font-display font-bold text-2xl">Switchit<span className="text-brand-500">Mart</span></span>
            </div>
            {/* <h1 className="font-display font-bold text-2xl text-gray-900">Welcome back</h1> */}
            <p className="text-gray-500 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input name="email" type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} className="input-field pr-10"
                  placeholder="••••••••" value={form.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader size={18} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <p className="text-xs font-semibold text-brand-700 mb-2">🧪 Demo Credentials</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>Seller: seller@demo.com / password123</p>
              <p>Buyer: buyer@demo.com / password123</p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-navy-900 to-brand-800 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-brand-500/20 rounded-full blur-2xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-navy-400/20 rounded-full blur-2xl" />
        </div>
        <div className="relative text-center text-white px-8">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="font-display font-bold text-3xl mb-3">Shop Local</h2>
          <p className="text-white/70 text-lg leading-relaxed">Discover amazing products from sellers in your neighbourhood</p>
        </div>
      </div>
    </div>
  );
}
