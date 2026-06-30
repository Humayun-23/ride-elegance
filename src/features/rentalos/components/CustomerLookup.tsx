import { useState } from 'react';
import { Search, UserPlus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { searchCustomer, createCustomer, getBookings } from '../services/rentalosService';
import { useRentalOS } from './RentalOSContext';
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import type { RentalCustomer, RentalCustomerSearch, RentalBooking } from '../types';
import { rentalOSKeys, useInvalidateRentalOS } from '../hooks/useRentalOSQueries';

const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export default function CustomerLookup() {
  const { shopId, setSelectedBooking, setSelectedVehicle, refreshBookings } = useRentalOS();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidateRentalOS = useInvalidateRentalOS();
  const [phone, setPhone] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');

  const [customer, setCustomer] = useState<RentalCustomerSearch | RentalCustomer | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [history, setHistory] = useState<RentalBooking[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleSearch = () => {
    if (!shopId) return;
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 20) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    setNotFound(false);
    setHistory([]);

    queryClient
      .fetchQuery({
        queryKey: [...rentalOSKeys.customers(shopId), 'search', phoneDigits],
        queryFn: async () => (await searchCustomer(shopId, phoneDigits)).data,
        staleTime: 2 * 60 * 1000,
      })
      .then((customerResult) => {
        setCustomer(customerResult);
        if (!customerResult.found) {
          setNotFound(true);
          setError('Customer not found. Please provide a name to create a new profile.');
        } else if (customerResult.id) {
          setLoadingHistory(true);
          queryClient
            .fetchQuery({
              queryKey: rentalOSKeys.bookings(shopId, { customer_id: customerResult.id }),
              queryFn: async () => (await getBookings(shopId, { customer_id: customerResult.id })).data,
              staleTime: 30 * 1000,
            })
            .then((bookings) => setHistory(bookings))
            .catch(err => console.error(err))
            .finally(() => setLoadingHistory(false));
        }
      })
      .catch((err) => {
        setCustomer(null);
        setError(err.response?.data?.detail || 'Search failed');
      })
      .finally(() => setLoading(false));
  };

  const handleCreate = () => {
    if (!shopId) return;
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 20) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    if (!firstname.trim()) {
      setError('First name is required');
      return;
    }
    setLoading(true);
    setError('');
    createCustomer({
      shop_id: shopId,
      phone_number: phoneDigits,
      firstname: firstname.trim(),
      lastname: lastname.trim() || undefined,
      document_consent: true,
      marketing_consent: false,
    })
      .then((res) => {
        setCustomer(res.data);
        setNotFound(false);
        invalidateRentalOS(shopId);
        refreshBookings();
      })
      .catch((err) => setError(err.response?.data?.detail || 'Failed to create'))
      .finally(() => setLoading(false));
  };

  const startWalkin = () => {
    setSelectedBooking(null);
    setSelectedVehicle(null);
    navigate('/rentalos/bookings');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 max-w-xl">
        <div className="flex-1">
          <label className={labelClass}>Phone number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              // Basic format to keep numbers, max 10
              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
              setPhone(val);
              if (customer || notFound) {
                setCustomer(null);
                setNotFound(false);
                setError('');
              }
            }}
            placeholder="Enter 10-digit phone"
            className={`${inputClass} text-lg py-2`}
            maxLength={10}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button onClick={handleSearch} disabled={loading || phone.length < 10} className={`${primaryButtonClass} h-[42px]`}>
          <Search className="w-4 h-4" />
          Look up
        </button>
      </div>

      {error && <p className="text-[13px] font-semibold text-[color:var(--rl-danger)]">{error}</p>}

      {notFound && (
        <div className="bg-[color:var(--rl-hover)] border rounded-lg p-5 max-w-xl space-y-4">
          <h4 className="font-semibold text-[color:var(--rl-ink)] text-sm">Create New Customer</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First name</label>
              <input type="text" placeholder="e.g. Rahul" value={firstname} onChange={(e) => setFirstname(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input type="text" placeholder="Optional" value={lastname} onChange={(e) => setLastname(e.target.value)} className={inputClass} />
            </div>
          </div>
          <button onClick={handleCreate} disabled={loading || !firstname} className={primaryButtonClass}>
            <UserPlus className="w-4 h-4" />
            Create Customer
          </button>
        </div>
      )}

      {customer && !notFound && (
        <div className="space-y-4">
          <div className="bg-white border border-[color:var(--rl-muted)]/20 shadow-sm rounded-lg p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[color:var(--rl-brand)]/10 flex items-center justify-center text-[color:var(--rl-brand-deep)] text-xl font-bold uppercase shrink-0">
              {customer.firstname ? customer.firstname[0] : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-bold text-[color:var(--rl-ink)] text-lg truncate">
                  {customer.firstname || 'Walk-in'} {customer.lastname}
                </h4>
                {customer.current_flag_status && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[color:var(--rl-danger-soft)] text-[color:var(--rl-danger)] uppercase tracking-wide">
                    {customer.current_flag_status.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[color:var(--rl-muted)] font-mono">{customer.phone_number}</p>

              {'latest_note' in customer && customer.latest_note && (
                <p className="text-[13px] text-[color:var(--rl-ink)] mt-2 bg-[color:var(--rl-warn-soft)] p-2 rounded text-[#8a5a10]">
                  <strong>Note: </strong>{customer.latest_note}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <button onClick={startWalkin} className={`${secondaryButtonClass} bg-[color:var(--rl-brand)]/10 text-[color:var(--rl-brand-deep)] border-transparent hover:bg-[color:var(--rl-brand)]/20`}>
                <FileText className="w-4 h-4" />
                Create walk-in
              </button>
              {'previous_booking_count' in customer && customer.previous_booking_count > 0 && (
                <span className="text-[12px] font-semibold text-[color:var(--rl-faint)]">
                  {customer.previous_booking_count} total trips
                </span>
              )}
            </div>
          </div>

          {'id' in customer && customer.id && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b bg-[color:var(--rl-hover)]">
                <h4 className="font-semibold text-[13px] text-[color:var(--rl-ink)]">Recent trips</h4>
              </div>
              {loadingHistory ? (
                <p className="p-5 text-center text-[13px] text-[color:var(--rl-faint)]">Loading history...</p>
              ) : history.length === 0 ? (
                <p className="p-5 text-center text-[13px] text-[color:var(--rl-faint)]">No past trips found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking #</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium text-[color:var(--rl-ink)] rl-num">#{b.id}</TableCell>
                        <TableCell>
                          <div className="text-[color:var(--rl-ink)]">{b.bike?.name}</div>
                          <div className="text-[11px] text-[color:var(--rl-muted)]">{b.bike?.model}</div>
                        </TableCell>
                        <TableCell className="rl-num text-[12px]">
                          {new Date(b.start_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(b.end_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-[color:var(--rl-muted)]">{b.status}</span>
                        </TableCell>
                        <TableCell className="text-right font-semibold rl-num">
                          ₹{currency.format(b.total_amount || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
