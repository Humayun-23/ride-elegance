import { useState } from 'react';
import { Plus, Settings2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import { useRentalOS } from './RentalOSContext';
import BookingWorkflow from './BookingWorkflow';
import CreateBooking from './CreateBooking';
import CustomerLookupStep from './CustomerLookupStep';
import type { RentalBooking, RentalCustomerSearch } from '../types';

export default function BookingModal() {
  const {
    selectedBooking,
    setSelectedBooking,
    manageBookingFocus,
    setManageBookingFocus,
    selectedVehicle,
    setSelectedVehicle,
    refreshBookings,
    createBookingOpen,
    setCreateBookingOpen
  } = useRentalOS();

  const [customerData, setCustomerData] = useState<RentalCustomerSearch | null>(null);

  const isCreate = createBookingOpen || selectedVehicle;
  const mode = isCreate ? 'create' : selectedBooking ? 'manage' : null;
  const isOpen = mode !== null;

  const handleCreated = (newBooking: RentalBooking) => {
    refreshBookings();
    setSelectedVehicle(null);
    setCreateBookingOpen(false);
    setSelectedBooking(newBooking);
  };

  const handleClose = () => {
    setSelectedBooking(null);
    setManageBookingFocus(null);
    setSelectedVehicle(null);
    setCreateBookingOpen(false);
    setCustomerData(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="rentalos rentalos-booking-sheet w-full sm:max-w-xl overflow-y-auto p-0">
        <div className="p-5">
          <SheetHeader className="mb-4 pb-4 border-b border-gray-100 flex flex-row items-center gap-2 space-y-0">
            {mode === 'create' ? (
              <Plus className="w-5 h-5 text-[color:var(--rl-brand)]" />
            ) : (
              <Settings2 className="w-5 h-5 text-[color:var(--rl-brand)]" />
            )}
            <SheetTitle className="text-base font-semibold text-[color:var(--rl-ink)]">
              {mode === 'create' ? 'Create booking' : 'Manage booking'}
            </SheetTitle>
          </SheetHeader>

          {mode === 'create' ? (
            !customerData ? (
              <CustomerLookupStep
                onContinue={(data) => setCustomerData(data)}
                onCancel={handleClose}
              />
            ) : (
              <CreateBooking
                initialCustomer={customerData}
                onCreated={handleCreated}
                onCancel={() => setCustomerData(null)}
              />
            )
          ) : mode === 'manage' && selectedBooking ? (
            <BookingWorkflow
              booking={selectedBooking}
              focusSection={manageBookingFocus}
              onFocusHandled={() => setManageBookingFocus(null)}
              onChanged={refreshBookings}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
