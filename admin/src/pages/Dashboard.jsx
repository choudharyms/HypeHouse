import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Home, IndianRupee, Loader2, ArrowUpRight, Activity } from 'lucide-react';
import { fetchDashboardStats } from '../lib/api';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    vacantRooms: 0,
    activeBookings: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const cards = [
    { name: 'Total PGs', value: stats.totalProperties, icon: Home, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
    { name: 'Active Bookings', value: stats.activeBookings, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+5%' },
    { name: 'Vacant Rooms', value: stats.vacantRooms, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50', trend: '-2%' },
    { name: 'Monthly Revenue', value: stats.monthlyRevenue.toLocaleString(), icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+18%', isCurrency: true },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Generating Insights...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="glass-card p-6 rounded-[2rem] flex flex-col justify-between group">
              <div className="flex justify-between items-start mb-4">
                <div className={`${card.bg} p-3.5 rounded-2xl transition-transform group-hover:scale-110 duration-300 shadow-sm`}>
                  <Icon className={card.color} size={24} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  <ArrowUpRight size={12} />
                  {card.trend}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{card.name}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {card.isCurrency ? '₹' : ''}{card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Analytics</h3>
              <p className="text-sm text-slate-500 font-medium">Performance over the last 30 days</p>
            </div>
            <button className="px-5 py-2.5 bg-slate-50 text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all border border-slate-100 uppercase tracking-wider">
              Download Report
            </button>
          </div>
          <div className="h-72 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-50/20 to-transparent"></div>
            <div className="text-center z-10">
               <TrendingUp size={48} className="mx-auto mb-4 text-slate-200" />
               <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">Live Analytics Engine</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Occupancy Rate</h3>
          <p className="text-sm text-slate-500 font-medium mb-10">Portfolio Utilization</p>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="16"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="16"
                strokeDasharray="502.6"
                strokeDashoffset="75.4" // 85%
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-900 tracking-tighter">85%</span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Optimal</span>
            </div>
          </div>
          
          <div className="mt-10 grid grid-cols-2 gap-4 w-full">
             <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</p>
                <p className="text-sm font-bold text-slate-900">92%</p>
             </div>
             <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-sm font-bold text-emerald-600">Healthy</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
