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

  const handleSearch = () => {
    if (!shopId || !phone || phone.length < 5) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    
    queryClient.fetchQuery({
      queryKey: [...rentalOSKeys.customers(shopId), 'search', phone],
      queryFn: async () => (await searchCustomer(shopId, phone)).data,
      staleTime: 2 * 60 * 1000,
    })
      .then((customerResult) => {
        setResult(customerResult);
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
    <div className="flex flex-col h-full space-y-6 pb-[env(safe-area-inset-bottom)]">
      <div className="text-center space-y-2 mt-4">
        <div className="w-12 h-12 bg-[color:var(--rl-hover)] rounded-full flex items-center justify-center mx-auto text-[color:var(--rl-brand-deep)]">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[color:var(--rl-ink)]">Find Customer</h3>
        <p className="text-[13px] text-[color:var(--rl-muted)] px-6">
          Enter the customer's phone number to retrieve their history or create a new profile.
        </p>
      </div>

      <div className="px-6 space-y-4">
        <div>
          <label className={labelClass}>Phone number</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="9999999999"
                className={`${inputClass} pl-10`}
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading || !phone}
              className="px-4 rounded-lg bg-[#010101] text-white text-[13px] font-semibold hover:bg-black transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>

        {result && result.found && (
          <div className="mt-6 border border-[color:var(--rl-border)] rounded-xl overflow-hidden bg-white shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <div className="p-4 bg-gray-50 border-b border-[color:var(--rl-border)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[color:var(--rl-brand-soft)] text-[color:var(--rl-brand-deep)] flex items-center justify-center font-bold text-lg shrink-0">
                {(result.firstname?.[0] || 'U').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[15px] font-bold text-[color:var(--rl-ink)] truncate">
                  {result.firstname || 'Walk-in'} {result.lastname || ''}
                </h4>
                <p className="text-[13px] text-[color:var(--rl-muted)]">{result.phone_number}</p>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-[13px] text-[color:var(--rl-muted)]">Previous bookings</span>
                </div>
                <span className="font-bold text-[color:var(--rl-ink)]">{result.previous_booking_count}</span>
              </div>

              {result.current_flag_status && (
                <div className={`p-3 rounded-lg border flex gap-2 ${isRisky ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                  {isRisky ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> : <Info className="w-5 h-5 shrink-0 mt-0.5" />}
                  <div className="space-y-1">
                    <p className="text-sm font-bold capitalize">{result.current_flag_status.replace(/_/g, ' ')}</p>
                    {result.latest_note && (
                      <p className="text-xs opacity-90 line-clamp-2">{result.latest_note}</p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => onContinue(result)}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-[color:var(--rl-brand)] text-[color:var(--rl-ink)] font-bold text-[14px] hover:scale-[1.02] transition-transform"
              >
                <CheckCircle2 className="w-4 h-4" />
                Continue with This Customer
              </button>
            </div>
          </div>
        )}

        {result && !result.found && (
          <div className="mt-6 p-5 border border-dashed border-gray-300 rounded-xl text-center space-y-4 animate-in fade-in">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[color:var(--rl-ink)]">No customer found</p>
              <p className="text-xs text-[color:var(--rl-muted)] mt-1">There are no existing customers matching {phone}.</p>
            </div>
            <button
              type="button"
              onClick={() => onContinue(result)}
              className={primaryButtonClass}
            >
              Create New Customer & Continue
            </button>
          </div>
        )}
      </div>
      
      <div className="flex-1" />
      
      <div className="p-4 border-t border-[color:var(--rl-border)] flex justify-between">
        <button type="button" onClick={() => onContinue({ found: false, phone_number: phone })} className="text-[13px] font-semibold text-[color:var(--rl-muted)] hover:text-[color:var(--rl-ink)]">
          Skip / New Customer
        </button>
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          Cancel
        </button>
      </div>
    </div>
  );
}
