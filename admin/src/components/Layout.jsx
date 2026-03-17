import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, CalendarCheck, LogOut, ShieldCheck } from 'lucide-react';
import { signOut } from '../lib/auth';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Insights', path: '/', icon: LayoutDashboard },
    { name: 'My Properties', path: '/pgs', icon: Building2 },
    { name: 'Reservations', path: '/bookings', icon: CalendarCheck },
    { name: 'My Profile', path: '/profile', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200/60 flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 pb-10 flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-500/30">
            <ShieldCheck size={28} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight block">HypeHouse</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">Partner Center</span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'nav-active' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'} />
                <span className="font-bold text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100/60 bg-slate-50/50">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Plan</p>
            <p className="text-sm font-bold text-slate-900">Premium Partner</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-5 py-3.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-10 sticky top-0 z-10">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {navItems.find(i => i.path === location.pathname)?.name || 'Admin'}
          </h1>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-black text-slate-900">Welcome back, Owner</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                System Live
              </p>
            </div>
            <Link to="/profile" className="w-10 h-10 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-600 font-black shadow-sm hover:border-blue-500 transition-all">
                O
            </Link>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
