import { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { searchCustomer, createCustomer } from '../services/rentalosService';
import { useRentalOS } from './RentalOSLayout';
import type { RentalCustomer, RentalCustomerSearch } from '../types';

export default function CustomerLookup() {
  const { shopId } = useRentalOS();
  const [phone, setPhone] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  
  const [customer, setCustomer] = useState<RentalCustomerSearch | RentalCustomer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = () => {
    if (!shopId || !phone) return;
    setLoading(true);
    setError('');
    searchCustomer(shopId, phone)
      .then(res => {
        setCustomer(res.data);
        if (!res.data.found) {
          setError('Customer not found. Add name and create a new customer or create a booking by phone.');
        }
      })
      .catch(err => {
        setCustomer(null);
        setError(err.response?.data?.detail || 'Search failed');
      })
      .finally(() => setLoading(false));
  };

  const handleCreate = () => {
    if (!phone || !shopId) {
      setError('Phone and active shop are required');
      return;
    }
    setLoading(true);
    setError('');
    createCustomer({
      shop_id: shopId,
      phone_number: phone,
      firstname: firstname || undefined,
      lastname: lastname || undefined,
      document_consent: true,
      marketing_consent: false,
    })
      .then(res => setCustomer(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to create'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Phone Number</label>
          <input 
            type="text" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">First Name</label>
          <input 
            type="text" 
            placeholder="e.g. Rahul"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Last Name</label>
          <input 
            type="text" 
            placeholder="Optional"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="flex-1 h-10 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          Lookup
        </button>
        <button 
          onClick={handleCreate}
          disabled={loading}
          className="flex-1 h-10 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          New Customer
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      {/* Result Card */}
      {customer && (
        <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold uppercase">
            {customer.firstname ? customer.firstname[0] : 'U'}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">{customer.firstname || 'Walk-in'} {customer.lastname}</h4>
            <p className="text-xs text-gray-500">{customer.phone_number}</p>
            {'latest_note' in customer && customer.latest_note && (
              <p className="text-xs text-gray-500 mt-1">{customer.latest_note}</p>
            )}
          </div>
          <div className="ml-auto">
            {customer.current_flag_status && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                {customer.current_flag_status.replace(/_/g, ' ')}
              </span>
            )}
            {'previous_booking_count' in customer && customer.previous_booking_count > 0 && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700 ml-2">
                {customer.previous_booking_count} Trips
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
