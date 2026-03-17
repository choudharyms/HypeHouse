import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Loader2, Save, Building2, MapPin, Target, Compass, Sparkles, Building, Briefcase, GraduationCap } from 'lucide-react';
import { createPG, updatePG, uploadPGImage } from '../lib/api';

export const PGForm = ({ pg = null, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');
  const [formData, setFormData] = useState(pg || {
    name: '',
    description: '',
    college_name: '',
    distance_from_college: '',
    room_type: 'Single',
    gender: 'Boys',
    address: '',
    city: '',
    price_per_month: 5000,
    security_deposit: 5000,
    total_rooms: 1,
    available_rooms: 1,
    amenities: ['Wifi', 'CCTV', 'Meals'],
    images: []
  });

  const amenitiesList = ['Wifi', 'AC', 'Power Backup', 'Laundry', 'CCTV', 'Meals', 'Parking', 'Cleaning'];

  const handleToggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleAddCustomAmenity = (e) => {
    if (e.key === 'Enter' && newAmenity.trim()) {
      e.preventDefault();
      if (!formData.amenities.includes(newAmenity.trim())) {
        setFormData(prev => ({
          ...prev,
          amenities: [...prev.amenities, newAmenity.trim()]
        }));
      }
      setNewAmenity('');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = files.map(file => uploadPGImage(pg?.id || 'temp', file));
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload images: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (pg) {
        await updatePG(pg.id, formData);
      } else {
        await createPG(formData);
      }
      onSuccess();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/50 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{pg ? 'Edit Property' : 'List New Property'}</h2>
            <p className="text-sm text-slate-500 font-medium">Capture the best details for your future residents</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Section: Basic Hero Details */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-px bg-blue-100"></span>
              Core Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">PG Name</label>
                <input
                  required
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white/50"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Royal Heritage PG"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nearby College</label>
                <input
                  required
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white/50"
                  value={formData.college_name}
                  onChange={e => setFormData({...formData, college_name: e.target.value})}
                  placeholder="e.g. Christ University"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Dist. to College (km)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white/50"
                  value={formData.distance_from_college}
                  onChange={e => setFormData({...formData, distance_from_college: parseFloat(e.target.value)})}
                  placeholder="0.5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">City</label>
                <input
                  required
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white/50"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  placeholder="Bangalore"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Rent / Month (₹)</label>
                <input
                  type="number"
                  required
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-blue-50/30 font-bold"
                  value={formData.price_per_month}
                  onChange={e => setFormData({...formData, price_per_month: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>

          {/* Section: Description & Location */}
          <div className="space-y-6 pt-4">
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-px bg-indigo-100"></span>
              Description & Location
            </h3>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Property Description (Optional)</label>
              <textarea
                rows={3}
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white/50"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Talk about your property, unique features, or the neighborhood..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Address</label>
              <textarea
                required
                rows={2}
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white/50"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                placeholder="House number, Street, Area..."
              />
            </div>
          </div>

          {/* Section: Amenities & Specifics */}
          <div className="space-y-6 pt-4">
            <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-px bg-emerald-100"></span>
              Amenities & Rules
            </h3>
            
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Property Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handleToggleAmenity(a)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      formData.amenities.includes(a)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200'
                    }`}
                  >
                    {a}
                  </button>
                ))}
                {formData.amenities.filter(a => !amenitiesList.includes(a)).map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handleToggleAmenity(a)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30 flex items-center gap-2"
                  >
                    {a}
                    <X size={12} />
                  </button>
                ))}
              </div>
              <div className="relative max-w-sm mt-3">
                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Type an amenity and press Enter..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm transition-all"
                  value={newAmenity}
                  onChange={e => setNewAmenity(e.target.value)}
                  onKeyDown={handleAddCustomAmenity}
                />
              </div>
            </div>
          </div>

          {/* Section: Photos */}
          <div className="space-y-6 pt-4 pb-4">
             <h3 className="text-sm font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
              <span className="w-8 h-px bg-orange-100"></span>
              Property Gallery
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {formData.images.map((img, i) => (
                <div key={i} className="aspect-[4/3] bg-slate-100 rounded-2xl relative overflow-hidden group border border-slate-200">
                  <img src={img} className="w-full h-full object-cover" alt="Property" />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 backdrop-blur-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <label className="aspect-[4/3] border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
                <div className="bg-slate-50 p-3 rounded-full mb-2">
                  <Upload size={24} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Add Photo</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageUpload} 
                />
              </label>
            </div>
          </div>
        </form>

        <div className="px-10 py-8 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-0 z-10 backdrop-blur-md">
          <p className="text-sm text-slate-500 font-medium italic">
            * All properties are reviewed before becoming visible to students.
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-8 py-3.5 rounded-2xl font-bold text-slate-600 hover:bg-white transition-all border border-transparent hover:border-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 sm:flex-none px-12 py-3.5 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 disabled:opacity-70 disabled:shadow-none translate-y-0 hover:-translate-y-1 active:scale-95 duration-200"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              <span>{pg ? 'Update Listing' : 'Publish Property'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
