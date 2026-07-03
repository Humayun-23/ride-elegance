import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, Search, CarFront, RefreshCw } from 'lucide-react';
import { useRentalOS } from './RentalOSContext';
import { inputClass, EmptyState } from './ui';
import type { CatalogVehicle } from '../types';
import { rentalOSErrorMessage, useRentalOSCatalog } from '../hooks/useRentalOSQueries';

const STATUS_META: Record<
  CatalogVehicle['rentalos_availability_status'],
  { label: string; pillClass: string; cardClass: string }
> = {
  available: {
    label: 'Available',
    pillClass: 'bg-[color:var(--rl-brand-soft)] text-[color:var(--rl-brand-deep)]',
    cardClass: '',
  },
  booked: {
    label: 'Booked',
    pillClass: 'bg-[color:var(--rl-info-soft)] text-[color:var(--rl-info)]',
    cardClass: 'opacity-75',
  },
  maintenance: {
    label: 'Maintenance',
    pillClass: 'bg-[color:var(--rl-warn-soft)] text-[#8a5a10]',
    cardClass: 'opacity-75',
  },
  unavailable: {
    label: 'Unavailable',
    pillClass: 'bg-[color:var(--rl-danger-soft)] text-[color:var(--rl-danger)]',
    cardClass: 'opacity-75',
  },
};

export default function CatalogueModal() {
  const { catalogueOpen, closeCatalogue, shopId, activeShop, setSelectedVehicle } = useRentalOS();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const {
    data: vehicles = [],
    error,
    isLoading: loading,
    isFetching,
    refetch,
  } = useRentalOSCatalog(shopId, undefined, undefined, { enabled: catalogueOpen });
  const errorMessage = error ? rentalOSErrorMessage(error, 'Failed to load catalogue.') : '';

  useEffect(() => {
    if (catalogueOpen) {
      setQuery('');
    }
  }, [catalogueOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((vehicle) =>
      [vehicle.name, vehicle.model, vehicle.bike_type, String(vehicle.bike_id)].some((field) =>
        String(field).toLowerCase().includes(q),
      ),
    );
  }, [vehicles, query]);

  if (!catalogueOpen) return null;

  const startBooking = (vehicle: CatalogVehicle) => {
    if (vehicle.rentalos_availability_status !== 'available') return;
    setSelectedVehicle(vehicle);
    closeCatalogue();
    navigate('/rentalos/bookings');
  };

  return (
    <DialogPrimitive.Root open={catalogueOpen} onOpenChange={(open) => !open && closeCatalogue()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-gray-900/50" />
        <DialogPrimitive.Content 
          className="rentalos fixed inset-0 z-[60] flex flex-col outline-none"
          aria-describedby={undefined}
        >
          <button type="button" aria-label="Close catalogue" className="absolute inset-0 outline-none" onClick={closeCatalogue} />

          <div className="relative mt-auto md:mt-0 md:m-auto flex h-[92vh] md:h-[85vh] w-full md:max-w-4xl flex-col rounded-t-2xl md:rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900">Catalogue</h2>
            <p className="text-xs text-gray-500 truncate">
              {activeShop ? `All vehicles at ${activeShop.shop_name}` : 'All vehicles'} · tap one to start a booking
            </p>
          </div>
          <button
            type="button"
            onClick={closeCatalogue}
            className="p-2 -mr-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close catalogue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, model or type..."
              className={`${inputClass} pl-9`}
            />
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center h-10 w-10 shrink-0 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            aria-label="Refresh catalogue"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-center py-10 text-gray-400 text-sm">Loading catalogue...</p>
          ) : errorMessage ? (
            <EmptyState icon={<CarFront className="w-6 h-6" />} message={errorMessage} />
          ) : filtered.length === 0 ? (
            <EmptyState icon={<CarFront className="w-6 h-6" />} message="No vehicles found." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((vehicle) => {
                const available = vehicle.rentalos_availability_status === 'available';
                const status = STATUS_META[vehicle.rentalos_availability_status];
                return (
                  <button
                    key={vehicle.bike_id}
                    type="button"
                    onClick={() => startBooking(vehicle)}
                    disabled={!available}
                    className={`text-left bg-white border border-gray-200 rounded-xl overflow-hidden transition-colors ${available ? 'hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20' : 'cursor-not-allowed'
                      } ${status.cardClass}`}
                  >
                    <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                      {vehicle.image_url ? (
                        <img src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-cover" />
                      ) : (
                        <CarFront className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{vehicle.name}</h4>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${status.pillClass}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 capitalize truncate mt-0.5">
                        #{vehicle.bike_id} · {vehicle.model} · {vehicle.bike_type}
                      </p>
                      <div className="mt-2 text-sm font-semibold text-gray-900">
                        ₹{vehicle.price_per_day} <span className="text-gray-400 text-xs font-normal">/ day</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
