import { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRentalOS } from './RentalOSContext';
import { EmptyState } from './ui';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import type { RentalBooking } from '../types';
import { useRentalOSBookings } from '../hooks/useRentalOSQueries';

interface BookingsListProps {
  onSelectBooking?: (booking: RentalBooking) => void;
}

const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function statusTone(status: string) {
  if (status === 'active') return 'rl-pill-ok';
  if (status === 'confirmed') return 'rl-pill-info';
  if (status === 'completed') return 'rl-pill-mute';
  if (status === 'cancelled') return 'rl-pill-danger';
  return 'rl-pill-warn';
}

type TabKey = 'all' | 'active' | 'due_today' | 'overdue' | 'completed';

function BookingRow({ booking, isSelected, onClick, now }: { booking: RentalBooking, isSelected: boolean, onClick: () => void, now: Date }) {
  const isActiveTrip = booking.status === 'active' || booking.status === 'confirmed';

  const end = new Date(booking.end_time);
  const isOverdue = isActiveTrip && !Number.isNaN(end.getTime()) && end < now;

  return (
    <div
      data-state={isSelected ? "selected" : undefined}
      onClick={onClick}
      className="cursor-pointer rounded-xl overflow-hidden border border-gray-200/80 hover:border-gray-300 transition-all data-[state=selected]:ring-2 data-[state=selected]:ring-black shadow-sm mb-3 block bg-white"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 w-full">
        <div className="flex-1 min-w-0 flex sm:flex-col justify-between sm:justify-start items-center sm:items-start">
          <div className="font-bold text-[color:var(--rl-ink)] truncate text-[14px]">
            {booking.customer?.firstname || 'Walk-in'} {booking.customer?.lastname || ''}
          </div>
          <div className="text-[11px] text-[color:var(--rl-muted)] font-medium bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            {booking.customer?.phone_number || `#${booking.id}`}
          </div>
        </div>
        <div className="flex-1 min-w-0 mt-1 sm:mt-0">
          <div className="text-[color:var(--rl-ink)] font-semibold truncate text-[13px]">
            {booking.bike?.name || `Bike ${booking.bike_id}`}
          </div>
          <div className="text-[11px] text-[color:var(--rl-muted)] truncate">
            {booking.bike?.model || ''}
          </div>
        </div>
        <div className="flex-1 min-w-0 mt-2 sm:mt-0">
          <div className="text-[12px] font-medium text-[color:var(--rl-ink)] bg-gray-50 inline-block px-2 py-1 rounded-md border border-gray-100">
            {!Number.isNaN(end.getTime()) ? end.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
          <span className={`rl-pill ${isOverdue ? 'rl-pill-danger' : statusTone(booking.status)}`}>
            {isOverdue ? 'Overdue' : booking.status}
          </span>
          <span className={`rl-num font-extrabold text-[15px] tracking-tight ${booking.balance_due > 0 ? 'text-[#8a5a10]' : 'text-[color:var(--rl-brand-deep)]'}`}>
            ₹{currency.format(booking.balance_due || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function BookingsList({ onSelectBooking }: BookingsListProps) {
  const { shopId, selectedBooking } = useRentalOS();
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const [sortCol, setSortCol] = useState<'customer' | 'vehicle' | 'end_time' | 'balance_due'>('end_time');
  const [sortAsc, setSortAsc] = useState(false);

  // Use a stable 'now' for the render cycle
  const now = useMemo(() => new Date(), []);
  const bookingFilters = useMemo(
    () => ({
      tab: activeTab,
      sort_by: sortCol,
      sort_dir: sortAsc ? 'asc' as const : 'desc' as const,
      timezone_offset_minutes: new Date().getTimezoneOffset(),
    }),
    [activeTab, sortAsc, sortCol],
  );
  const { data, isLoading: loading, hasNextPage, fetchNextPage, isFetchingNextPage } = useRentalOSBookings(shopId, bookingFilters);

  const bookings = useMemo(() => data?.pages.flatMap((p) => p.items) || [], [data]);
  const counts = data?.pages[0]?.counts || { all: 0, active: 0, due_today: 0, overdue: 0, completed: 0 };

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: bookings.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 104, // Approx height of the card
    overscan: 5,
  });

  // Infinite Scroll Trigger
  const virtualItems = rowVirtualizer.getVirtualItems();
  useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1];
    if (
      lastItem &&
      lastItem.index >= bookings.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    virtualItems,
    bookings.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  useEffect(() => {
    parentRef.current?.scrollTo({ top: 0 });
    rowVirtualizer.scrollToIndex(0);
  }, [activeTab, rowVirtualizer, sortAsc, sortCol]);

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(col === 'balance_due' ? false : true);
    }
  };

  const SortIcon = ({ col }: { col: typeof sortCol }) => {
    if (sortCol !== col) return null;
    return <span className="ml-1">{sortAsc ? '↑' : '↓'}</span>;
  };

  return (
    <div className="flex flex-col gap-4 relative">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <TabsList className="bg-transparent p-0 justify-start h-auto space-x-1 border-b w-full rounded-none">
          <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[color:var(--rl-brand)] data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-2">
            All <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{counts.all}</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[color:var(--rl-brand)] data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-2">
            Active <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">{counts.active}</span>
          </TabsTrigger>
          <TabsTrigger value="due_today" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[color:var(--rl-brand)] data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-2">
            Due today <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">{counts.due_today}</span>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[color:var(--rl-brand)] data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-2">
            Overdue <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">{counts.overdue}</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[color:var(--rl-brand)] data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 py-2">
            Completed <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{counts.completed}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading && bookings.length === 0 ? (
        <p className="text-center py-6 text-[color:var(--rl-faint)] text-sm">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <EmptyState icon={<Calendar className="w-6 h-6" />} message="No bookings match this filter." />
      ) : (
        <div className="flex flex-col w-full relative pt-2 h-[600px] overflow-y-auto" ref={parentRef}>
          <div className="flex items-center justify-between mb-4 mt-1 sticky top-0 bg-white z-10 pb-2">
            <div className="flex items-center gap-2 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1 pb-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest shrink-0 mr-1">Sort:</span>
              {(['end_time', 'customer', 'balance_due'] as const).map(col => (
                <button
                  key={col}
                  onClick={() => handleSort(col)}
                  className={`whitespace-nowrap shrink-0 px-3 py-1.5 text-[11px] font-bold rounded-full uppercase tracking-wider transition-all border ${sortCol === col ? 'border-gray-300 bg-white text-black shadow-sm' : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-100/80'}`}
                >
                  {col.replace('_', ' ')} <SortIcon col={col} />
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualRow) => {
              const b = bookings[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <BookingRow
                    booking={b}
                    isSelected={selectedBooking?.id === b.id}
                    onClick={() => onSelectBooking?.(b)}
                    now={now}
                  />
                </div>
              );
            })}
          </div>

          {isFetchingNextPage && (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
