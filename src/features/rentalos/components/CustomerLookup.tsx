import { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { searchCustomer, createCustomer } from '../services/rentalosService';
import { useRentalOS } from './RentalOSLayout';
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './ui';
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
      .then((res) => {
        setCustomer(res.data);
        if (!res.data.found) {
          setError('Customer not found. Add a name and create a new customer, or create a booking by phone.');
        }
      })
      .catch((err) => {
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
      .then((res) => setCustomer(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to create'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Phone number</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9999999999" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>First name</label>
          <input type="text" placeholder="e.g. Rahul" value={firstname} onChange={(e) => setFirstname(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Last name</label>
          <input type="text" placeholder="Optional" value={lastname} onChange={(e) => setLastname(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={handleSearch} disabled={loading} className={`${primaryButtonClass} flex-1`}>
          <Search className="w-4 h-4" />
          Look up
        </button>
        <button onClick={handleCreate} disabled={loading} className={`${secondaryButtonClass} flex-1`}>
          <UserPlus className="w-4 h-4" />
          New customer
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {customer && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold uppercase shrink-0">
            {customer.firstname ? customer.firstname[0] : 'U'}
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">
              {customer.firstname || 'Walk-in'} {customer.lastname}
            </h4>
            <p className="text-xs text-gray-500">{customer.phone_number}</p>
            {'latest_note' in customer && customer.latest_note && (
              <p className="text-xs text-gray-500 mt-1">{customer.latest_note}</p>
            )}
          </div>
          <div className="ml-auto flex flex-wrap gap-2 justify-end">
            {customer.current_flag_status && (
              <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                {customer.current_flag_status.replace(/_/g, ' ')}
              </span>
            )}
            {'previous_booking_count' in customer && customer.previous_booking_count > 0 && (
              <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                {customer.previous_booking_count} trips
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
