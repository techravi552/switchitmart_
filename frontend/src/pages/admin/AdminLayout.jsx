import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ClipboardList, CreditCard, Bell, Activity, LogOut, MapPin, Menu, X, ChevronRight, LifeBuoy, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import logo2 from './.././../assets/logo/logo2.png';

const NAV = [
  { to:'dashboard',     icon:<LayoutDashboard size={17}/>, label:'Dashboard' },
  { to:'users',         icon:<Users size={17}/>,           label:'Users' },
  { to:'products',      icon:<Package size={17}/>,         label:'Products' },
  { to:'orders',        icon:<ClipboardList size={17}/>,   label:'Orders' },
  { to:'subscriptions', icon:<CreditCard size={17}/>,      label:'Subscriptions' },
  { to:'chats',         icon:<MessageCircle size={17}/>,   label:'All Chats' },
  { to:'support',       icon:<LifeBuoy size={17}/>,        label:'Support' },
  { to:'notify',        icon:<Bell size={17}/>,            label:'Send Notification' },
  { to:'activity',      icon:<Activity size={17}/>,        label:'Activity Logs' },
];

export default function AdminLayout() {
  const navigate  = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('adminUser')||'{}');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); toast.success('Logged out'); navigate('/admin/login'); };

  const Sidebar = ({ mobile=false }) => (
    <div className="flex flex-col h-full bg-navy-900">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-orange"><MapPin size={18} className="text-white"/></div> */}
           <img src={logo2} className="w-9 h-6" alt="" />
          <div><p className="font-display font-bold text-white text-sm">SwitchitMart</p><p className="text-white/40 text-xs">Admin Panel v3</p></div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item=>(
          <NavLink key={item.to} to={`/admin/${item.to}`} onClick={()=>mobile&&setSidebarOpen(false)}
            className={({isActive})=>`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive?'bg-brand-500 text-white shadow-orange':'text-white/60 hover:bg-white/10 hover:text-white'}`}>
            {item.icon}{item.label}<ChevronRight size={14} className="ml-auto opacity-40"/>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">{adminUser.name?.[0]?.toUpperCase()}</span></div>
          <div className="min-w-0"><p className="text-white text-xs font-semibold truncate">{adminUser.name}</p><p className="text-white/40 text-xs">Administrator</p></div>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-all"><LogOut size={16}/>Logout</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-body">
      <div className="hidden lg:flex w-60 shrink-0"><Sidebar/></div>
      {sidebarOpen&&(
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 shrink-0"><Sidebar mobile/></div>
          <div className="flex-1 bg-black/50" onClick={()=>setSidebarOpen(false)}/>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><Menu size={20}/></button>
          <div className="hidden lg:block"><p className="text-sm text-gray-500">Welcome, <span className="font-semibold text-gray-800">{adminUser.name}</span></p></div>
          <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 lg:p-6"><Outlet/></div>
      </div>
    </div>
  );
}
