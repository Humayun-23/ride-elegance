import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, CarFront, RefreshCw } from 'lucide-react';
import { getShopBikes } from '../services/rentalosService';
import { useRentalOS } from './RentalOSLayout';
import { inputClass, EmptyState } from './ui';
import type { CatalogVehicle, ShopBike } from '../types';

export default function CatalogueModal() {
  const { catalogueOpen, closeCatalogue, shopId, activeShop, setSelectedVehicle } = useRentalOS();
  const navigate = useNavigate();

  const [bikes, setBikes] = useState<ShopBike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const fetchBikes = () => {
    if (!shopId) return;
    setLoading(true);
    setError('');
    getShopBikes(shopId)
      .then((res) => setBikes(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load catalogue.'))
      .finally(() => setLoading(false));
  };

  // Fetch whenever the modal opens (or the active shop changes while open).
  useEffect(() => {
    if (catalogueOpen) {
      setQuery('');
      fetchBikes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogueOpen, shopId]);

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!catalogueOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCatalogue();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [catalogueOpen, closeCatalogue]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bikes;
    return bikes.filter((b) =>
      [b.name, b.model, b.bike_type, String(b.id)].some((field) => String(field).toLowerCase().includes(q)),
    );
  }, [bikes, query]);

  if (!catalogueOpen) return null;

  const startBooking = (bike: ShopBike) => {
    const vehicle: CatalogVehicle = {
      bike_id: bike.id,
      shop_id: bike.shop_id,
      name: bike.name,
      model: bike.model,
      bike_type: bike.bike_type,
      price_per_hour: bike.price_per_hour,
      price_per_day: bike.price_per_day,
      condition: bike.condition,
      maintenance_status: bike.maintenance_status,
      is_available: bike.is_available,
      image_url: bike.image_url,
      rentalos_availability_status: bike.is_available ? 'available' : 'unavailable',
    };
    setSelectedVehicle(vehicle);
    closeCatalogue();
    navigate('/rentalos/bookings');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/50" role="dialog" aria-modal="true" aria-label="Vehicle catalogue">
      <button type="button" aria-label="Close catalogue" className="absolute inset-0" onClick={closeCatalogue} />

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
            onClick={fetchBikes}
            disabled={loading}
            className="inline-flex items-center justify-center h-10 w-10 shrink-0 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            aria-label="Refresh catalogue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-center py-10 text-gray-400 text-sm">Loading catalogue...</p>
          ) : error ? (
            <EmptyState icon={<CarFront className="w-6 h-6" />} message={error} />
          ) : filtered.length === 0 ? (
            <EmptyState icon={<CarFront className="w-6 h-6" />} message="No vehicles found." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((bike) => {
                const available = bike.is_available;
                return (
                  <button
                    key={bike.id}
                    type="button"
                    onClick={() => startBooking(bike)}
                    className="text-left bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-teal-500 hover:ring-2 hover:ring-teal-500/20 transition-colors"
                  >
                    <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                      {bike.image_url ? (
                        <img src={bike.image_url} alt={bike.name} className="w-full h-full object-cover" />
                      ) : (
                        <CarFront className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{bike.name}</h4>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                            available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {available ? 'free' : 'busy'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 capitalize truncate mt-0.5">
                        #{bike.id} · {bike.model} · {bike.bike_type}
                      </p>
                      <div className="mt-2 text-sm font-semibold text-gray-900">
                        ₹{bike.price_per_day} <span className="text-gray-400 text-xs font-normal">/ day</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
