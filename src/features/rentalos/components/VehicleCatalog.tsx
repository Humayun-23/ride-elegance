import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getCatalogVehicles } from '../services/rentalosService';
import { useRentalOS } from './RentalOSLayout';
import type { CatalogVehicle } from '../types';

interface VehicleCatalogProps {
  onVehicleSelect?: (vehicle: CatalogVehicle) => void;
}

export default function VehicleCatalog({ onVehicleSelect }: VehicleCatalogProps) {
  const { shopId } = useRentalOS();
  
  // Set default start to now, end to +8 hours
  const now = new Date();
  const startStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const end = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const endStr = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [startDate, setStartDate] = useState(startStr);
  const [endDate, setEndDate] = useState(endStr);
  const [vehicles, setVehicles] = useState<CatalogVehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCatalog = () => {
    if (!shopId) return;
    setLoading(true);
    getCatalogVehicles(shopId, startDate, endDate)
      .then(res => setVehicles(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCatalog();
  }, [shopId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-400 mb-1">Start Time</label>
          <input 
            type="datetime-local" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-400 mb-1">End Time</label>
          <input 
            type="datetime-local" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
        <div className="flex items-end">
          <button 
            onClick={fetchCatalog}
            className="h-10 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white font-bold px-6 rounded-xl shadow-lg shadow-teal-500/30 transition-all active:scale-95 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Check
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse">Loading catalog...</div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">No vehicles available</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <button
              key={v.bike_id}
              type="button"
              onClick={() => onVehicleSelect?.(v)}
              className="text-left bg-gray-50/50 border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                {v.image_url ? (
                  <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm truncate max-w-[120px]">#{v.bike_id} {v.name}</h4>
                  <p className="text-xs text-gray-500 capitalize">{v.model} • {v.bike_type}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  v.rentalos_availability_status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {v.rentalos_availability_status.toUpperCase()}
                </span>
              </div>
              <div className="mt-3 text-sm font-bold text-teal-600">
                ₹{v.price_per_day} <span className="text-gray-400 text-xs font-normal">/ day</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
