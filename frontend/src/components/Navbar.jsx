import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ShoppingCart, Store, LayoutDashboard, Package, ClipboardList, CreditCard, LogOut, Menu, X, MapPin, MessageCircle, LifeBuoy, Heart, BarChart2, Sun, Moon } from 'lucide-react';
import NotificationBell from './NotificationBell';
import logo1 from '../assets/logo/logo-light.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };
  const isActive = p => location.pathname.startsWith(p);

  const sellerLinks = [
    { to:'/seller/dashboard',    icon:<LayoutDashboard size={15}/>, label:'Dashboard' },
    { to:'/seller/products',     icon:<Package size={15}/>,         label:'Products' },
    { to:'/seller/orders',       icon:<ClipboardList size={15}/>,   label:'Orders' },
    { to:'/seller/analytics',    icon:<BarChart2 size={15}/>,       label:'Analytics' },
    { to:'/seller/subscriptions',icon:<CreditCard size={15}/>,      label:'Plans' },
    { to:'/chat',                icon:<MessageCircle size={15}/>,   label:'Messages' },
    { to:'/support',             icon:<LifeBuoy size={15}/>,        label:'Support' },
  ];
  const buyerLinks = [
    { to:'/products',    icon:<ShoppingCart size={15}/>,  label:'Shop' },
    { to:'/buyer/orders',icon:<ClipboardList size={15}/>, label:'Orders' },
    { to:'/wishlist',    icon:<Heart size={15}/>,          label:'Wishlist' },
    { to:'/chat',        icon:<MessageCircle size={15}/>, label:'Messages' },
    { to:'/support',     icon:<LifeBuoy size={15}/>,      label:'Support' },
  ];
  const links = user?.role==='seller'?sellerLinks:user?.role==='buyer'?buyerLinks:[];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            {/* <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-orange group-hover:scale-105 transition-transform">
              <MapPin size={18} className="text-white"/>
            </div> */}

                <img src={logo1} className="w-9 h-6" alt="" />
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">Switchit<span className="text-brand-500">Mart</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {links.map(l=>(
              <Link key={l.to} to={l.to} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive(l.to)?'bg-brand-50 text-brand-600 dark:bg-brand-900/30':'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                {l.icon}{l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {dark?<Sun size={18} className="text-yellow-400"/>:<Moon size={18} className="text-gray-500"/>}
            </button>
            {user ? (
              <>
                {(user.role==='seller'||user.role==='buyer')&&<NotificationBell/>}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-7 h-7 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user.name[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-none">{user.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                  <LogOut size={15}/>
                </button>
              </>
            ) : (
              <>
                <Link to="/login"  className="btn-secondary text-sm py-2">Sign In</Link>
                <Link to="/signup" className="btn-primary  text-sm py-2">Get Started</Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {dark?<Sun size={18} className="text-yellow-400"/>:<Moon size={18} className="text-gray-500"/>}
            </button>
            {user&&(user.role==='seller'||user.role==='buyer')&&<NotificationBell/>}
            <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={()=>setOpen(!open)}>
              {open?<X size={20}/>:<Menu size={20}/>}
            </button>
          </div>
        </div>

        {open&&(
          <div className="md:hidden pb-4 border-t border-gray-100 dark:border-gray-800 mt-2 pt-3 animate-fade-in">
            <div className="flex flex-col gap-1">
              {links.map(l=>(
                <Link key={l.to} to={l.to} onClick={()=>setOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive(l.to)?'bg-brand-50 text-brand-600':'text-gray-600 dark:text-gray-300'}`}>
                  {l.icon}{l.label}
                </Link>
              ))}
              {user?<button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500"><LogOut size={16}/>Logout</button>:(
                <div className="flex gap-2 mt-2">
                  <Link to="/login"  onClick={()=>setOpen(false)} className="flex-1 btn-secondary text-sm text-center">Sign In</Link>
                  <Link to="/signup" onClick={()=>setOpen(false)} className="flex-1 btn-primary  text-sm text-center">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
