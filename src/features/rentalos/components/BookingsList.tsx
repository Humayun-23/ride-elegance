import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { getBookings } from '../services/rentalosService';
import { useRentalOS } from './RentalOSLayout';
import { EmptyState } from './ui';
import type { RentalBooking } from '../types';

interface BookingsListProps {
  onSelectBooking?: (booking: RentalBooking) => void;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-teal-50 text-teal-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function BookingsList({ onSelectBooking }: BookingsListProps) {
  const { shopId, refreshKey, selectedBooking } = useRentalOS();
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    getBookings(shopId, status ? { status } : undefined)
      .then((res) => setBookings(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [shopId, status, refreshKey]);

  return (
    <div className="flex flex-col gap-3">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="self-start bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
      >
        <option value="">All statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {loading ? (
        <p className="text-center py-6 text-gray-400 text-sm">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <EmptyState icon={<Calendar className="w-6 h-6" />} message="No bookings match this filter." />
      ) : (
        <ul className="flex flex-col gap-2">
          {bookings.map((b) => {
            const isSelected = selectedBooking?.id === b.id;
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => onSelectBooking?.(b)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    isSelected ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500/20' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {b.customer?.firstname || 'Walk-in'} {b.customer?.lastname || ''}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[b.status] || 'bg-gray-100 text-gray-500'}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    #{b.id} · {b.bike?.name || `Bike ${b.bike_id}`}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-gray-400">Due {new Date(b.end_time).toLocaleDateString()}</span>
                    <span className={`font-semibold ${b.balance_due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{b.balance_due}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
