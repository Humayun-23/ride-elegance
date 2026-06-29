import { useState } from 'react';
import VehicleCatalog from '../components/VehicleCatalog';
import CustomerLookup from '../components/CustomerLookup';
import CreateBooking from '../components/CreateBooking';
import BookingsList from '../components/BookingsList';
import BookingWorkflow from '../components/BookingWorkflow';
import StaffManagement from '../components/StaffManagement';
import { CarFront, ShieldCheck, Store } from 'lucide-react';
import { useRentalOS } from '../components/RentalOSLayout';
import type { CatalogVehicle, RentalBooking } from '../types';

export default function DashboardPage() {
  const { activeShop, isOwner } = useRentalOS();
  const [selectedVehicle, setSelectedVehicle] = useState<CatalogVehicle | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<RentalBooking | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshBookings = () => setRefreshKey((key) => key + 1);

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Shop</p>
            <h4 className="text-xl font-bold text-gray-800 truncate max-w-[220px]">{activeShop?.shop_name || 'Select shop'}</h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-400 flex items-center justify-center text-white shadow-lg shadow-teal-400/40">
            <Store className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Access Mode</p>
            <h4 className="text-xl font-bold text-gray-800">{isOwner ? 'Owner' : 'Staff'}</h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-400 flex items-center justify-center text-white shadow-lg shadow-teal-400/40">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Selected Vehicle</p>
            <h4 className="text-xl font-bold text-gray-800 truncate max-w-[220px]">
              {selectedVehicle ? `#${selectedVehicle.bike_id} ${selectedVehicle.name}` : 'None'}
            </h4>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-400 flex items-center justify-center text-white shadow-lg shadow-teal-400/40">
            <CarFront className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Customer Lookup</h3>
            <CustomerLookup />
          </div>

          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Vehicle Catalog</h3>
            <VehicleCatalog onVehicleSelect={setSelectedVehicle} />
          </div>
          
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Active & Due Bookings</h3>
            <BookingsList refreshKey={refreshKey} onSelectBooking={setSelectedBooking} />
          </div>

          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Workflow</h3>
            <BookingWorkflow booking={selectedBooking} onChanged={refreshBookings} />
          </div>

          {isOwner && (
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Staff Access</h3>
              <StaffManagement />
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100 p-6 xl:sticky xl:top-28">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Create Booking</h3>
            <CreateBooking selectedVehicle={selectedVehicle} onCreated={refreshBookings} />
          </div>
        </div>
      </div>
    </div>
  );
}
