import React, { useState, useEffect } from 'react';
import { Calendar, Search, Filter, CheckCircle2, XCircle, Clock, ChevronRight, Loader2, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchMyBookings, updateBookingStatus } from '../lib/api';

export const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    loadBookings();

    // Real-time listener for new bookings
    const subscription = supabase
      .channel('admin-bookings')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'bookings' 
      }, () => {
        loadBookings(); // Reload to get student/pg details too
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function loadBookings() {
    try {
      const data = await fetchMyBookings();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (id, status) => {
    await updateBookingStatus(id, status);
    loadBookings();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Upcoming': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Past': return 'bg-slate-50 text-slate-500 border-slate-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const filteredBookings = (bookings || []).filter(b => activeFilter === 'All' || b.status === activeFilter);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Reservations...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full lg:w-auto mt-2 custom-scrollbar">
          {['All', 'Pending', 'Upcoming', 'Active', 'Past', 'Cancelled'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                activeFilter === filter 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/25' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by student or PG..." 
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white/50"
          />
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resident</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Listing</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-base shadow-sm group-hover:border-blue-200 transition-all">
                        {booking.profiles?.full_name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-tight">{booking.profiles?.full_name}</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{booking.profiles?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-800">{booking.pgs?.name}</p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-1">Room {booking.room_number || 'TBD'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-bold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit">
                      <Calendar size={12} className="text-blue-500" />
                      <span>{new Date(booking.check_in).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      <ChevronRight size={10} className="text-slate-300" />
                      <span>{new Date(booking.check_out).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="flex-1 h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${booking.payment_status === 'Paid' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-orange-400'}`}
                            style={{ width: booking.payment_status === 'Paid' ? '100%' : '30%' }}
                          />
                       </div>
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{booking.payment_status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {booking.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(booking.id, 'Upcoming')}
                            className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Accept Request"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}
                             className="p-2.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                             title="Reject Request"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {booking.status === 'Upcoming' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(booking.id, 'Active')}
                            className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Check In"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}
                             className="p-2.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                             title="Cancel"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button className="p-2.5 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredBookings.length === 0 && (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Clock className="text-slate-300" size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-black text-slate-900">No matching reservations</h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">Adjust your filters or check back later for new bookings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
