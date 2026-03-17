import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Save, Loader2, Camera, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Profile = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    business_name: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          business_name: profile.business_name,
          updated_at: new Date()
        })
        .eq('id', user.id);

      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Admin Profile</h2>
          <p className="text-slate-500 font-medium">Manage your personal and business identity</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
          <ShieldCheck size={16} />
          Verified Account
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Avatar & Badge */}
        <div className="space-y-6">
          <div className="glass-card p-10 flex flex-col items-center text-center rounded-[2.5rem]">
            <div className="relative group">
              <div className="w-32 h-32 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 overflow-hidden border-4 border-white shadow-xl">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User size={64} strokeWidth={1.5} />
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-90">
                <Camera size={20} />
              </button>
            </div>
            <div className="mt-6">
              <h3 className="text-xl font-black text-slate-900 leading-tight">{profile.full_name || 'HypeHouse Partner'}</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Property Manager</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4 bg-blue-600 text-white border-none shadow-xl shadow-blue-500/20">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-80 text-center">Platform Status</h4>
            <div className="flex justify-around items-center pt-2">
               <div className="text-center">
                  <p className="text-2xl font-black">Pro</p>
                  <p className="text-[10px] uppercase font-black opacity-60 mt-0.5">Plan</p>
               </div>
               <div className="w-px h-8 bg-white/20"></div>
               <div className="text-center">
                  <p className="text-2xl font-black">94%</p>
                  <p className="text-[10px] uppercase font-black opacity-60 mt-0.5">Trust Score</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Col: Details Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleUpdateProfile} className="glass-card p-10 rounded-[2.5rem] space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 bg-slate-50/30"
                    value={profile.full_name}
                    onChange={e => setProfile({...profile, full_name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="space-y-2 opacity-60 cursor-not-allowed">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    readOnly
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none bg-slate-50 font-bold text-slate-500"
                    value={profile.email}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 bg-slate-50/30"
                    value={profile.phone}
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Business/PG Group</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 bg-slate-50/30"
                    value={profile.business_name}
                    onChange={e => setProfile({...profile, business_name: e.target.value})}
                    placeholder="e.g. Royal Living Co."
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                disabled={saving}
                type="submit"
                className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50 active:scale-95"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                <span>Update Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
