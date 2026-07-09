import { useState } from 'react';
import { Search, UserPlus, Phone, AlertTriangle, Info, CheckCircle2, FileText, CalendarClock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { searchCustomer } from '../services/rentalosService';
import { useRentalOS } from './RentalOSContext';
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './ui';
import type { RentalCustomerSearch } from '../types';
import { rentalOSKeys } from '../hooks/useRentalOSQueries';

interface CustomerLookupStepProps {
  onContinue: (customerData: RentalCustomerSearch) => void;
  onCancel: () => void;
}

const RISKY_FLAGS = ['payment_issue', 'late_return', 'damage_issue', 'document_issue', 'banned', 'watchlist'];

export default function CustomerLookupStep({ onContinue, onCancel }: CustomerLookupStepProps) {
  const { shopId } = useRentalOS();
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RentalCustomerSearch | null>(null);
  const [error, setError] = useState('');

  const handleSearch = (searchPhone = phone) => {
    if (!shopId || !searchPhone || searchPhone.length < 5) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    
    queryClient.fetchQuery({
      queryKey: [...rentalOSKeys.customers(shopId), 'search', searchPhone],
      queryFn: async () => (await searchCustomer(shopId, searchPhone)).data,
      staleTime: 2 * 60 * 1000,
    })
      .then((customerResult) => {
        setResult(customerResult);
        if (!customerResult.found) {
          // Auto skip to booking form for new customer
          onContinue({ ...customerResult, phone_number: searchPhone });
        }
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to search customer');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const isRisky = result?.current_flag_status && RISKY_FLAGS.includes(result.current_flag_status.toLowerCase());

  return (
    <div className="flex flex-col h-full bg-white relative animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col overflow-y-auto px-6 pt-10 pb-[env(safe-area-inset-bottom)]">
        
        {/* Header Section */}
        <div className="text-center space-y-4 mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60 shadow-sm rounded-2xl flex items-center justify-center mx-auto text-black rotate-3 hover:rotate-0 transition-transform duration-300">
            <Search className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-2xl font-extrabold text-black tracking-tight">Find Customer</h3>
            <p className="text-[14px] text-gray-500 max-w-sm mx-auto leading-relaxed">
              Enter the customer's phone number to retrieve their history or create a new profile.
            </p>
          </div>
        </div>

        {/* Search Input Section */}
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone number</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(val);
                  if (val.length === 10) {
                    handleSearch(val);
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter 10-digit number"
                className="w-full h-16 pl-12 pr-[110px] bg-gray-50/50 border border-gray-200 rounded-2xl text-[16px] font-semibold text-black focus:outline-none focus:bg-white focus:ring-4 focus:ring-black/5 focus:border-black transition-all shadow-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading || !phone}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-xl bg-black text-white text-[14px] font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:hover:bg-black hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center min-w-[90px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </div>
            {error && <p className="text-red-500 text-[13px] font-semibold ml-1 mt-2 animate-in fade-in slide-in-from-top-1 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {error}</p>}
          </div>

          {/* Search Results */}
          {result && result.found && (
            <div className="border border-gray-200/80 rounded-3xl overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-5 bg-gradient-to-b from-gray-50/50 to-white border-b border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                  {(result.firstname?.[0] || 'U').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[17px] font-extrabold text-black truncate">
                    {result.firstname || 'Walk-in'} {result.lastname || ''}
                  </h4>
                  <p className="text-[14px] font-medium text-gray-500 mt-0.5">{result.phone_number}</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center bg-gray-50/80 p-4 rounded-2xl border border-gray-100/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      <FileText className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-[14px] font-semibold text-gray-600">Previous bookings</span>
                  </div>
                  <span className="text-[16px] font-extrabold text-black bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">{result.previous_booking_count}</span>
                </div>

                {result.current_flag_status && (
                  <div className={`p-4 rounded-2xl border flex gap-3 items-start ${isRisky ? 'bg-red-50/50 border-red-100 text-red-800' : 'bg-blue-50/50 border-blue-100 text-blue-800'}`}>
                    {isRisky ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" /> : <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />}
                    <div className="space-y-1.5">
                      <p className="text-[14px] font-bold capitalize">{result.current_flag_status.replace(/_/g, ' ')}</p>
                      {result.latest_note && (
                        <p className="text-[13px] font-medium opacity-80 leading-relaxed">{result.latest_note}</p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onContinue(result)}
                  className="w-full h-14 mt-2 flex items-center justify-center gap-2.5 rounded-2xl bg-black text-white font-bold text-[15px] hover:bg-gray-900 transition-all hover:shadow-lg hover:shadow-black/10 active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Select this Customer
                </button>
              </div>
            </div>
          )}

          {result && !result.found && (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-3xl text-center space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-gray-50/50">
              <div className="w-14 h-14 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center mx-auto text-gray-400">
                <UserPlus className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-[16px] font-bold text-black">No customer found</p>
                <p className="text-[14px] text-gray-500">There are no existing customers matching <span className="font-semibold text-gray-700">{phone}</span>.</p>
              </div>
              <button
                type="button"
                onClick={() => onContinue(result)}
                className="w-full h-12 flex items-center justify-center rounded-xl bg-black text-white font-bold text-[14px] hover:bg-gray-900 transition-all active:scale-[0.98] shadow-md"
              >
                Create New Profile
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="p-6 flex items-center justify-start mt-auto border-t border-gray-100 bg-white/80 backdrop-blur-md">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gray-100 text-gray-600 text-[14px] font-bold hover:bg-gray-200 hover:text-black transition-all active:scale-[0.98]">
          Cancel
        </button>
      </div>
    </div>
  );
}
