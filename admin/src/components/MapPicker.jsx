import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

export const MapPicker = ({ lat, lng, onChange }) => {
  const [position, setPosition] = useState(lat && lng ? { lat, lng } : null);
  const [searchQuery, setSearchQuery] = useState('');

  // Default center (Bangalore) if no position is provided
  const defaultCenter = [12.9716, 77.5946];

  useEffect(() => {
    if (position) {
      onChange(position.lat, position.lng);
    }
  }, [position]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        alert("Location not found");
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search location (e.g. Koramangala, Bangalore)"
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
        >
          Search
        </button>
      </div>
      
      <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <MapContainer 
          center={position ? [position.lat, position.lng] : defaultCenter} 
          zoom={13} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          {position && <ChangeView center={[position.lat, position.lng]} />}
        </MapContainer>
      </div>
      
      <div className="flex justify-between items-center px-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {position ? `Lat: ${position.lat.toFixed(6)}, Lng: ${position.lng.toFixed(6)}` : 'Click on map to set location'}
        </p>
        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest italic">
          Tip: You can search or click anywhere
        </p>
      </div>
    </div>
  );
};
