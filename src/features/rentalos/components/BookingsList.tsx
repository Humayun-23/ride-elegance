import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { getBookings } from '../services/rentalosService';
import { useRentalOS } from './RentalOSLayout';
import type { RentalBooking } from '../types';

interface BookingsListProps {
  refreshKey?: number;
  onSelectBooking?: (booking: RentalBooking) => void;
}

export default function BookingsList({ refreshKey, onSelectBooking }: BookingsListProps) {
  const { shopId } = useRentalOS();
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    getBookings(shopId, status ? { status } : undefined)
      .then(res => setBookings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [shopId, status, refreshKey]);

  if (loading) {
    return <div className="text-center py-6 text-gray-400 animate-pulse">Loading bookings...</div>;
  }

  if (bookings.length === 0) {
    return <div className="text-center py-6 text-gray-400 border-2 border-dashed rounded-xl">No active bookings</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700"
        >
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {bookings.map((b) => (
        <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${
              b.status === 'active' || b.status === 'confirmed' ? 'bg-teal-50 text-teal-500' : 'bg-gray-50 text-gray-400'
            }`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm">
                {b.customer?.firstname || 'Walk-in'} {b.customer?.lastname}
              </h4>
              <p className="text-xs text-gray-500">#{b.id} • {b.bike?.name || `Bike ${b.bike_id}`} • {b.status}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-gray-400">Due</p>
              <p className="text-sm font-semibold text-gray-700">
                {new Date(b.end_time).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-400">Balance</p>
              <p className={`text-sm font-bold ${b.balance_due > 0 ? 'text-red-500' : 'text-green-500'}`}>
                ₹{b.balance_due}
              </p>
            </div>
            <div className="hidden sm:block">
              <button
                type="button"
                onClick={() => onSelectBooking?.(b)}
                className="px-4 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg group-hover:bg-teal-500 group-hover:text-white transition-colors"
              >
                View
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
