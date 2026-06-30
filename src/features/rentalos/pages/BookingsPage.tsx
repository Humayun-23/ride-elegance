import { useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import BookingsList from '../components/BookingsList';
import { Card } from '../components/ui';
import { useRentalOS } from '../components/RentalOSContext';
import type { RentalBooking } from '../types';

export default function BookingsPage() {
  const { setSelectedBooking, setCreateBookingOpen } = useRentalOS();
  const [searchParams, setSearchParams] = useSearchParams();

  const startCreate = useCallback(() => {
    setSelectedBooking(null);
    setCreateBookingOpen(true);
  }, [setCreateBookingOpen, setSelectedBooking]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      startCreate();
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('new');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams, startCreate]);

  const selectBooking = (booking: RentalBooking) => {
    setSelectedBooking(booking);
  };

  return (
    <div className="w-full">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[color:var(--rl-ink)]">Bookings</h3>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[color:var(--rl-brand)] text-white text-sm font-semibold hover:bg-[color:var(--rl-brand-deep)] transition-colors"
          >
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
        <BookingsList onSelectBooking={selectBooking} />
      </Card>
    </div>
  );
}
