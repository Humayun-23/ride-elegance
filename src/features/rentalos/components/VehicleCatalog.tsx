import { useMemo, useState } from 'react';
import { Search, CarFront, Wrench } from 'lucide-react';
import { useRentalOS } from './RentalOSContext';
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass, EmptyState } from './ui';
import type { CatalogVehicle } from '../types';
import { useRentalOSCatalog } from '../hooks/useRentalOSQueries';

interface VehicleCatalogProps {
  onVehicleSelect?: (vehicle: CatalogVehicle) => void;
  selectedBikeId?: number | null;
}

const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

const STATUS_META: Record<
  CatalogVehicle['rentalos_availability_status'],
  { label: string; dotClass: string; textClass: string; cardClass: string }
> = {
  available: {
    label: 'Available',
    dotClass: 'bg-[color:var(--rl-brand)]',
    textClass: 'text-[color:var(--rl-brand-deep)]',
    cardClass: '',
  },
  booked: {
    label: 'Booked',
    dotClass: 'bg-[color:var(--rl-info)]',
    textClass: 'text-[color:var(--rl-info)]',
    cardClass: 'opacity-75',
  },
  maintenance: {
    label: 'Maintenance',
    dotClass: 'bg-[color:var(--rl-warn)]',
    textClass: 'text-[#8a5a10]',
    cardClass: 'opacity-75',
  },
  unavailable: {
    label: 'Unavailable',
    dotClass: 'bg-[color:var(--rl-danger)]',
    textClass: 'text-[color:var(--rl-danger)]',
    cardClass: 'opacity-75',
  },
};

export default function VehicleCatalog({ onVehicleSelect, selectedBikeId }: VehicleCatalogProps) {
  const { shopId, isOwner } = useRentalOS();

  const initialRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const end = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    return {
      start,
      end: new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    };
  }, []);

  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [bulkMaintenance, setBulkMaintenance] = useState(false);
  const { data: vehicles = [], isLoading: loading, refetch, isFetching } = useRentalOSCatalog(shopId, startDate, endDate);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
        <div className="flex flex-1 gap-3">
          <div className="flex-1 max-w-[200px]">
            <label className={labelClass}>Start time</label>
            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
          </div>
          <div className="flex-1 max-w-[200px]">
            <label className={labelClass}>End time</label>
            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
          </div>
          <button onClick={() => refetch()} disabled={isFetching} className={primaryButtonClass}>
            <Search className="w-4 h-4" />
            {isFetching ? 'Checking' : 'Check'}
          </button>
        </div>
        
        {isOwner && (
          <button 
            type="button" 
            onClick={() => setBulkMaintenance(!bulkMaintenance)}
            className={`${secondaryButtonClass} ${bulkMaintenance ? 'bg-[color:var(--rl-warn-soft)] border-[#8a5a10] text-[#8a5a10]' : ''}`}
          >
            <Wrench className="w-4 h-4" />
            {bulkMaintenance ? 'Done maintaining' : 'Bulk maintenance'}
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-center py-10 text-[color:var(--rl-faint)] text-sm">Loading catalog...</p>
      ) : vehicles.length === 0 ? (
        <EmptyState icon={<CarFront className="w-6 h-6" />} message="No vehicles found for this time range." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {vehicles.map((v) => {
            const available = v.rentalos_availability_status === 'available';
            const isSelected = selectedBikeId === v.bike_id;
            const status = STATUS_META[v.rentalos_availability_status];
            return (
              <button
                key={v.bike_id}
                type="button"
                onClick={() => {
                  if (available) onVehicleSelect?.(v);
                }}
                disabled={!available}
                className={`text-left bg-white border rounded-lg overflow-hidden transition-colors ${
                  available ? 'hover:border-[color:var(--rl-muted)]' : 'cursor-not-allowed'
                } ${status.cardClass} ${
                  isSelected ? 'border-[color:var(--rl-brand)] ring-1 ring-[color:var(--rl-brand)]' : 'border-gray-200'
                }`}
              >
                <div className="h-20 bg-[color:var(--rl-hover)] flex items-center justify-center overflow-hidden">
                  {v.image_url ? (
                    <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                  ) : (
                    <CarFront className="w-8 h-8 text-[color:var(--rl-faint)]" />
                  )}
                </div>
                <div className="p-3">
                  <div className="min-w-0 mb-2">
                    <h4 className="font-semibold text-[13px] text-[color:var(--rl-ink)] truncate">{v.name}</h4>
                    <p className="text-[11px] text-[color:var(--rl-muted)] capitalize truncate">
                      #{v.bike_id} · {v.model}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className={`w-2 h-2 rounded-full ${status.dotClass}`} />
                    <span className={`text-[11px] font-semibold ${status.textClass}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="text-[12px] font-semibold text-[color:var(--rl-ink)]">
                    <span className="rl-num">₹{currency.format(v.price_per_day)}</span> <span className="text-[color:var(--rl-faint)] font-normal">/ d</span>
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
