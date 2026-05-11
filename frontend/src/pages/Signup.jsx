import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Eye, EyeOff, Loader, Store, ShoppingBag, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import logo1 from '../assets/logo/logo-light.png';

export default function Signup() {
  const [role, setRole]     = useState('buyer');
  const [form, setForm]     = useState({ name:'', email:'', password:'', phone:'', shopName:'', shopDescription:'' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const requestGPS = () => {
    if (!navigator.geolocation) return toast.error('GPS not supported');
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        toast.success('Location saved! 📍 Nearby products will show for you.');
        setGpsLoading(false);
      },
      () => { toast.error('GPS permission denied — you can set location later'); setGpsLoading(false); }
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Fill all required fields');
    if (form.password.length < 6) return toast.error('Password min 6 characters');
    setLoading(true);
    try {
      const payload = { ...form, role };
      if (location) { payload.latitude = location.latitude; payload.longitude = location.longitude; }
      const user = await signup(payload);
      toast.success(`Welcome, ${user.name}! 🎉`);
      navigate(role === 'seller' ? '/seller/dashboard' : '/products');
    } catch (err) { toast.error(err.response?.data?.message || 'Signup failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            {/* <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-orange">
              <MapPin size={20} className="text-white"/>
            </div> */}
            <img src={logo1} className="w-9 h-6" alt="" />
            <span className="font-display font-bold text-2xl">Switchit<span className="text-brand-500">Mart</span></span>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Create your account</h1>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-5 p-1 bg-gray-100 dark:bg-gray-700 rounded-2xl">
          {[{ id:'buyer',label:'Buy Products',icon:<ShoppingBag size={18}/>},{id:'seller',label:'Sell Products',icon:<Store size={18}/>}].map(r=>(
            <button key={r.id} type="button" onClick={()=>setRole(r.id)}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${role===r.id?'bg-white dark:bg-gray-800 shadow-card text-brand-600':'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
              {r.icon}{r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input name="name" className="input-field" placeholder="Your name" value={form.name} onChange={handleChange}/>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input name="email" type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={handleChange}/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
              <div className="relative">
                <input name="password" type={showPass?'text':'password'} className="input-field pr-10" placeholder="Min 6" value={form.password} onChange={handleChange}/>
                <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input name="phone" className="input-field" placeholder="10-digit" value={form.phone} onChange={handleChange}/>
            </div>
          </div>

          {role === 'seller' && (
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">Shop Details</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shop Name</label>
                <input name="shopName" className="input-field" placeholder="My Awesome Shop" value={form.shopName} onChange={handleChange}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shop Description</label>
                <textarea name="shopDescription" className="input-field resize-none h-14 text-sm" placeholder="Tell buyers about your shop..." value={form.shopDescription} onChange={handleChange}/>
              </div>
            </div>
          )}

          {/* GPS Permission */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 mb-2">
              {role === 'buyer'
                ? '📍 Share location to see products near you'
                : '📍 Share location for delivery radius calculation'}
            </p>
            <button type="button" onClick={requestGPS} disabled={gpsLoading || !!location}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${location ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-300' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'}`}>
              {gpsLoading ? <Loader size={16} className="animate-spin"/> : <Navigation size={16}/>}
              {location ? '✓ Location saved' : 'Allow Location Access (Recommended)'}
            </button>
            {!location && <p className="text-xs text-gray-400 text-center mt-1">You can also set location later from your profile</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader size={18} className="animate-spin"/>Creating...</> : `Create ${role==='seller'?'Seller':'Buyer'} Account`}
          </button>
        </form>

        {role === 'seller' && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-xs text-amber-800 dark:text-amber-300">
            💡 Free plan (3 products/month) activated automatically on signup.
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-4 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
