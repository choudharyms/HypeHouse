import React, { useState, useEffect } from 'react';
import { Building2, MapPin, MoreVertical, Edit2, Trash2, Eye, Plus, Search, Loader2, GraduationCap, ShieldCheck, Edit3, User, UserCheck, Users, Building, Star } from 'lucide-react';
import { fetchMyPGs, toggleVacancy, deletePG } from '../lib/api';
import { PGForm } from '../components/PGForm';

export const PGs = () => {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPG, setSelectedPG] = useState(null);

  useEffect(() => {
    loadPGs();
  }, []);

  async function loadPGs() {
    try {
      const data = await fetchMyPGs();
      setPgs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleVacancy = async (id, currentStatus) => {
    try {
      await toggleVacancy(id, currentStatus !== 'Available');
      loadPGs();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Properties</h2>
          <p className="text-slate-500 font-medium">Manage and optimize your real estate portfolio</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 hover:-translate-y-1 active:scale-95 duration-200"
        >
          <Plus size={24} strokeWidth={3} />
          <span>Add New Property</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Portfolio...</p>
        </div>
      ) : pgs.length === 0 ? (
        <div className="glass-card rounded-[2.5rem] p-20 text-center space-y-6">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
            <Building2 size={40} className="text-slate-300" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">No properties listed yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">Ready to start earning? Add your first PG property to reach thousands of students.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-10 py-4 border-2 border-slate-200 text-slate-900 font-black rounded-2xl hover:bg-slate-50 transition-all"
          >
            Start Your Journey
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pgs.map((pg) => (
            <div key={pg.id} className="glass-card rounded-[2rem] overflow-hidden group flex flex-col h-full ring-1 ring-slate-200/50 hover:ring-blue-500/30 transition-all duration-500">
              <div className="aspect-[16/10] relative overflow-hidden">
                <img
                  src={pg.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'}
                  alt={pg.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                 <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-900 shadow-sm border border-white/50 flex items-center gap-1.5">
                      {pg.gender === 'Boys' && <User size={12} className="text-blue-600" />}
                      {pg.gender === 'Girls' && <UserCheck size={12} className="text-pink-600" />}
                      {pg.gender === 'Co-ed' && <Users size={12} className="text-indigo-600" />}
                      {pg.gender}
                    </div>
                   {pg.verified && (
                     <div className="bg-blue-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-blue-500/30 flex items-center gap-1">
                       <ShieldCheck size={12} />
                       Verified
                     </div>
                   )}
                </div>
                
                {/* Vacancy Toggle Overlay */}
                <div className="absolute top-4 right-4 group/toggle">
                   <button 
                    onClick={() => handleToggleVacancy(pg.id, pg.availability)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-md transition-all border ${
                      pg.availability === 'Full' 
                      ? 'bg-red-500/90 text-white border-red-400' 
                      : 'bg-emerald-500/90 text-white border-emerald-400'
                    }`}
                   >
                     <span className="text-[9px] font-black uppercase tracking-widest">
                       {pg.availability === 'Full' ? 'Full' : 'Vacant'}
                     </span>
                     <div className={`w-8 h-4 rounded-full bg-white/20 p-0.5 relative transition-colors duration-300`}>
                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                          pg.availability === 'Full' ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                     </div>
                   </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-2xl">
                    <p className="text-white font-black text-xl leading-tight drop-shadow-md">{pg.name}</p>
                    <div className="flex items-center gap-1 text-white/80 text-xs mt-1">
                      <MapPin size={12} />
                      {pg.city}
                    </div>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col space-y-6">
                <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                   <div className="flex items-center gap-2 text-blue-600">
                     <GraduationCap size={18} />
                     <span>{pg.college_name || 'Near College'}</span>
                   </div>
                   <div className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600 text-[10px] font-black uppercase">
                     {pg.distance_from_college || '0.5'} km
                   </div>
                   <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100/50">
                     <Star size={14} className="text-yellow-500 fill-yellow-500" />
                     <span className="text-yellow-700 font-black text-[11px]">{pg.rating || '0.0'}</span>
                     <span className="text-slate-400 text-[10px] font-bold">({pg.review_count || 0})</span>
                   </div>
                </div>

                <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100 items-center">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100/50 flex items-center gap-1">
                    <Building size={10} />
                    {pg.room_type}
                  </span>
                  {pg.amenities?.slice(0, 2).map((a, i) => (
                    <span key={i} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                      {a}
                    </span>
                  ))}
                  {pg.amenities?.length > 2 && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                      +{pg.amenities.length - 2}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Starting from</p>
                    <p className="text-2xl font-black text-slate-900">₹{pg.price_per_month.toLocaleString()}<span className="text-sm text-slate-400 font-bold"> /mo</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPG(pg);
                        setShowForm(true);
                      }}
                      className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-blue-500/20 active:scale-90 duration-200"
                      title="Edit listing"
                    >
                      <Edit3 size={20} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Move this property to trash?")) {
                          deletePG(pg.id);
                          loadPGs();
                        }
                      }}
                      className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-500/20 active:scale-90 duration-200"
                      title="Delete listing"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PGForm
          pg={selectedPG}
          onClose={() => {
            setShowForm(false);
            setSelectedPG(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedPG(null);
            loadPGs();
          }}
        />
      )}
    </div>
  );
};
