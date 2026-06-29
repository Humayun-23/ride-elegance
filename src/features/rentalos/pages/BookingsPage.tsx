import { useState } from 'react';
import { Plus, Settings2 } from 'lucide-react';
import BookingsList from '../components/BookingsList';
import BookingWorkflow from '../components/BookingWorkflow';
import CreateBooking from '../components/CreateBooking';
import { Card } from '../components/ui';
import { useRentalOS } from '../components/RentalOSLayout';
import type { RentalBooking } from '../types';

export default function BookingsPage() {
  const { selectedBooking, setSelectedBooking, selectedVehicle, setSelectedVehicle, refreshBookings } = useRentalOS();
  // Default to create mode when arriving from a vehicle selection, otherwise manage.
  const [mode, setMode] = useState<'create' | 'manage'>(selectedVehicle || !selectedBooking ? 'create' : 'manage');

  const startCreate = () => {
    setMode('create');
  };

  const selectBooking = (booking: RentalBooking) => {
    setSelectedBooking(booking);
    setMode('manage');
  };

  const handleCreated = () => {
    refreshBookings();
    setSelectedVehicle(null);
    setMode('manage');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-1">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Bookings</h3>
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
          <BookingsList onSelectBooking={selectBooking} />
        </Card>
      </div>

      <div className="xl:col-span-2">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
            {mode === 'create' ? (
              <Plus className="w-5 h-5 text-teal-600" />
            ) : (
              <Settings2 className="w-5 h-5 text-teal-600" />
            )}
            <h3 className="text-base font-semibold text-gray-900">
              {mode === 'create' ? 'Create booking' : 'Manage booking'}
            </h3>
          </div>

          {mode === 'create' ? (
            <CreateBooking onCreated={handleCreated} />
          ) : (
            <BookingWorkflow booking={selectedBooking} onChanged={refreshBookings} />
          )}
        </Card>
      </div>
    </div>
  );
}
