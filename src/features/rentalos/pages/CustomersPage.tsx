import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Phone, Search, UserRound } from 'lucide-react';
import CustomerLookup from '../components/CustomerLookup';
import { EmptyState, SectionCard, inputClass, secondaryButtonClass } from '../components/ui';
import { useRentalOS } from '../components/RentalOSContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import type { RentalBooking, RentalCustomer } from '../types';
import { useRentalOSBookings, useRentalOSCustomers } from '../hooks/useRentalOSQueries';

const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function customerName(customer: RentalCustomer) {
  return `${customer.firstname || ''} ${customer.lastname || ''}`.trim() || 'Walk-in customer';
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CustomersPage() {
  const { shopId, setSelectedBooking } = useRentalOS();
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<RentalCustomer | null>(null);
  const [query, setQuery] = useState('');
  const { data: customers = [], isLoading: loadingCustomers } = useRentalOSCustomers(shopId);
  const historyFilters = useMemo(
    () => (selectedCustomer ? { customer_id: selectedCustomer.id } : undefined),
    [selectedCustomer],
  );
  const {
    data: historyPages,
    isLoading: loadingHistory,
  } = useRentalOSBookings(shopId, historyFilters, { enabled: Boolean(selectedCustomer), limit: 100 });

  const history = useMemo(
    () => historyPages?.pages.flatMap((page) => page.items) || [],
    [historyPages],
  );

  useEffect(() => {
    setSelectedCustomer((current) => {
      if (!current) return customers[0] || null;
      return customers.find((customer) => customer.id === current.id) || customers[0] || null;
    });
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((customer) =>
      [customerName(customer), customer.phone_number, customer.current_flag_status || ''].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [customers, query]);

  return (
    <div className="space-y-6">
      <SectionCard
        title="Customer lookup"
        description="Search by phone number to view history, or create a new customer record."
      >
        <CustomerLookup />
      </SectionCard>

      <SectionCard
        title="Customer directory"
        description="Shop customer records and booking history."
      >
        <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.25fr] gap-4">
          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="p-3 border-b bg-[color:var(--rl-hover)]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--rl-faint)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, phone, flag..."
                  className={`${inputClass} pl-9`}
                />
              </label>
            </div>

            {loadingCustomers ? (
              <p className="p-6 text-center text-[13px] text-[color:var(--rl-faint)]">Loading customers...</p>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-4">
                <EmptyState icon={<UserRound className="w-6 h-6" />} message="No customers found for this shop." />
              </div>
            ) : (
              <div className="max-h-[520px] overflow-y-auto divide-y">
                {filteredCustomers.map((customer) => {
                  const selected = selectedCustomer?.id === customer.id;
                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => setSelectedCustomer(customer)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-[color:var(--rl-hover)] ${
                        selected ? 'bg-[color:var(--rl-brand-soft)]' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-[color:var(--rl-ink)]">{customerName(customer)}</p>
                          <p className="rl-num mt-0.5 flex items-center gap-1 text-[11px] text-[color:var(--rl-muted)]">
                            <Phone className="h-3 w-3" />
                            {customer.phone_number}
                          </p>
                        </div>
                        {customer.current_flag_status && (
                          <span className="rl-pill rl-pill-danger shrink-0">{customer.current_flag_status.replace(/_/g, ' ')}</span>
                        )}
                      </div>
                      <p className="mt-2 text-[11px] text-[color:var(--rl-faint)]">Created {formatDate(customer.created_at)}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border rounded-lg overflow-hidden bg-white">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-[color:var(--rl-hover)]">
              <div className="min-w-0">
                <h4 className="truncate text-[13px] font-semibold text-[color:var(--rl-ink)]">
                  {selectedCustomer ? customerName(selectedCustomer) : 'Select a customer'}
                </h4>
                {selectedCustomer && (
                  <p className="rl-num text-[11px] text-[color:var(--rl-muted)]">{selectedCustomer.phone_number}</p>
                )}
              </div>
              <span className="rl-num text-[11px] font-semibold text-[color:var(--rl-muted)]">{history.length} trips</span>
            </div>

            {!selectedCustomer ? (
              <div className="p-4">
                <EmptyState icon={<FileText className="w-6 h-6" />} message="Select a customer to view trips." />
              </div>
            ) : loadingHistory ? (
              <p className="p-6 text-center text-[13px] text-[color:var(--rl-faint)]">Loading history...</p>
            ) : history.length === 0 ? (
              <div className="p-4">
                <EmptyState icon={<FileText className="w-6 h-6" />} message="No bookings found for this customer." />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="rl-num font-medium">#{booking.id}</TableCell>
                      <TableCell>
                        <div className="text-[13px] text-[color:var(--rl-ink)]">{booking.bike?.name || `Bike ${booking.bike_id}`}</div>
                        <div className="text-[11px] text-[color:var(--rl-muted)]">{booking.bike?.model || 'Vehicle'}</div>
                      </TableCell>
                      <TableCell className="rl-num text-[12px]">{formatDate(booking.start_time)}</TableCell>
                      <TableCell>
                        <span className="rl-pill rl-pill-mute">{booking.status}</span>
                      </TableCell>
                      <TableCell className="rl-num text-right font-semibold">₹{currency.format(booking.balance_due || 0)}</TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBooking(booking);
                            navigate('/rentalos/bookings');
                          }}
                          className={`${secondaryButtonClass} h-7 px-2 text-[11px]`}
                        >
                          Open
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </SectionCard>

    </div>
  );
}
