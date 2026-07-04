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
    pillClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    cardClass: '',
  },
  booked: {
    label: 'Booked',
    pillClass: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
    cardClass: 'opacity-75',
  },
  maintenance: {
    label: 'Maintenance',
    pillClass: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
    cardClass: 'opacity-75 grayscale-[50%]',
  },
  unavailable: {
    label: 'Unavailable',
    pillClass: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
    cardClass: 'opacity-75 grayscale-[50%]',
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
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm transition-all" />
        <DialogPrimitive.Content 
          className="rentalos fixed inset-0 z-[60] flex flex-col outline-none"
          aria-describedby={undefined}
        >
          <button type="button" aria-label="Close catalogue" className="absolute inset-0 outline-none" onClick={closeCatalogue} />

          <div className="relative mt-auto md:mt-0 md:m-auto flex h-[92vh] md:h-[85vh] w-full md:max-w-5xl flex-col rounded-t-3xl md:rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-gray-900/5 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Vehicle Catalogue</h2>
            <p className="text-sm text-gray-500 font-medium truncate mt-0.5">
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
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 group">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[color:var(--rl-brand)] transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, model or type..."
              className={`${inputClass} pl-10 rounded-full bg-gray-50/50 border-gray-200/60 focus:bg-white focus:ring-2 focus:ring-[color:var(--rl-brand)]/20 focus:border-[color:var(--rl-brand)] transition-all h-11 shadow-sm`}
            />
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center justify-center h-11 w-11 shrink-0 rounded-full border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm hover:border-gray-300 disabled:opacity-50 transition-all"
            aria-label="Refresh catalogue"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 rounded-b-3xl">
          {loading ? (
            <p className="text-center py-10 text-gray-400 text-sm">Loading catalogue...</p>
          ) : errorMessage ? (
            <EmptyState icon={<CarFront className="w-6 h-6" />} message={errorMessage} />
          ) : filtered.length === 0 ? (
            <EmptyState icon={<CarFront className="w-6 h-6" />} message="No vehicles found." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filtered.map((vehicle) => {
                const available = vehicle.rentalos_availability_status === 'available';
                const status = STATUS_META[vehicle.rentalos_availability_status];
                return (
                  <button
                    key={vehicle.bike_id}
                    type="button"
                    onClick={() => startBooking(vehicle)}
                    disabled={!available}
                    className={`group text-left bg-white border border-gray-200/75 rounded-2xl overflow-hidden transition-all duration-300 ${available ? 'hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-[color:var(--rl-brand)]/40 hover:ring-2 hover:ring-[color:var(--rl-brand)]/10' : 'cursor-not-allowed'
                      } ${status.cardClass}`}
                  >
                    <div className="aspect-[4/3] bg-gray-100/80 flex items-center justify-center overflow-hidden relative">
                      {vehicle.image_url ? (
                        <img src={vehicle.image_url} alt={vehicle.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <CarFront className="w-8 h-8 text-gray-300" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-[15px] leading-tight truncate">{vehicle.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tracking-wide uppercase ${status.pillClass}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-500 capitalize truncate font-medium">
                        #{vehicle.bike_id} · {vehicle.model}
                      </p>
                      <div className="mt-3 text-[15px] font-bold text-gray-900 flex items-baseline gap-1">
                        ₹{vehicle.price_per_day} <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider">/ day</span>
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
