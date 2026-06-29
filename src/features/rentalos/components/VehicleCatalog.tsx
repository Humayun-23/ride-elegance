import { useState, useEffect } from 'react';
import { Search, CarFront } from 'lucide-react';
import { getCatalogVehicles } from '../services/rentalosService';
import { useRentalOS } from './RentalOSLayout';
import { inputClass, labelClass, primaryButtonClass, EmptyState } from './ui';
import type { CatalogVehicle } from '../types';

interface VehicleCatalogProps {
  onVehicleSelect?: (vehicle: CatalogVehicle) => void;
  selectedBikeId?: number | null;
}

export default function VehicleCatalog({ onVehicleSelect, selectedBikeId }: VehicleCatalogProps) {
  const { shopId } = useRentalOS();

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
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label className={labelClass}>Start time</label>
          <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </div>
        <div className="flex-1">
          <label className={labelClass}>End time</label>
          <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
        </div>
        <button onClick={fetchCatalog} className={primaryButtonClass}>
          <Search className="w-4 h-4" />
          Check availability
        </button>
      </div>

      {loading ? (
        <p className="text-center py-10 text-gray-400 text-sm">Loading catalog...</p>
      ) : vehicles.length === 0 ? (
        <EmptyState icon={<CarFront className="w-6 h-6" />} message="No vehicles found for this time range." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => {
            const available = v.rentalos_availability_status === 'available';
            const isSelected = selectedBikeId === v.bike_id;
            return (
              <button
                key={v.bike_id}
                type="button"
                onClick={() => onVehicleSelect?.(v)}
                className={`text-left bg-white border rounded-xl overflow-hidden transition-colors ${
                  isSelected ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="h-28 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {v.image_url ? (
                    <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                  ) : (
                    <CarFront className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{v.name}</h4>
                      <p className="text-xs text-gray-500 capitalize truncate">
                        #{v.bike_id} · {v.model} · {v.bike_type}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {v.rentalos_availability_status}
                    </span>
                  </div>
                  <div className="mt-3 text-sm font-semibold text-gray-900">
                    ₹{v.price_per_day} <span className="text-gray-400 text-xs font-normal">/ day</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
