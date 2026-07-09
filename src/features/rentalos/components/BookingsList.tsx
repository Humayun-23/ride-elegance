import { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';
import { useRentalOS } from './RentalOSContext';
import { EmptyState } from './ui';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import type { RentalBooking } from '../types';
import { useRentalOSBookings } from '../hooks/useRentalOSQueries';

interface BookingsListProps {
  onSelectBooking?: (booking: RentalBooking) => void;
}

const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function isSameDay(dateStr: string, compare: Date) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  return date.getFullYear() === compare.getFullYear() && date.getMonth() === compare.getMonth() && date.getDate() === compare.getDate();
}

function statusTone(status: string) {
  if (status === 'active') return 'rl-pill-ok';
  if (status === 'confirmed') return 'rl-pill-info';
  if (status === 'completed') return 'rl-pill-mute';
  if (status === 'cancelled') return 'rl-pill-danger';
  return 'rl-pill-warn';
}

type TabKey = 'all' | 'active' | 'due_today' | 'overdue' | 'completed';

function SwipeableRow({ booking, isSelected, onClick, onSwipeComplete, now }: { booking: RentalBooking, isSelected: boolean, onClick: () => void, onSwipeComplete: () => void, now: Date }) {
  const controls = useAnimation();
  const isActiveTrip = booking.status === 'active' || booking.status === 'confirmed';

  const end = new Date(booking.end_time);
  const isOverdue = isActiveTrip && !Number.isNaN(end.getTime()) && end < now;

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isActiveTrip && info.offset.x > 80) {
      onSwipeComplete();
    }
    controls.start({ x: 0 });
  };

  const RowContent = (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 w-full bg-white">
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
  );

  const cardClasses = "cursor-pointer rounded-xl overflow-hidden border border-gray-200/80 hover:border-gray-300 transition-all data-[state=selected]:ring-2 data-[state=selected]:ring-black shadow-sm mb-3 touch-pan-y block";

  if (!isActiveTrip) {
    return (
      <div
        data-state={isSelected ? "selected" : undefined}
        onClick={onClick}
        className={cardClasses}
      >
        {RowContent}
      </div>
    );
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      animate={controls}
      data-state={isSelected ? "selected" : undefined}
      onClick={onClick}
      className={cardClasses}
    >
      {RowContent}
    </motion.div>
  );
}

export default function BookingsList({ onSelectBooking }: BookingsListProps) {
  const { shopId, selectedBooking } = useRentalOS();
  const { data: allBookings = [], isLoading: loading } = useRentalOSBookings(shopId);
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const [sortCol, setSortCol] = useState<'customer' | 'vehicle' | 'end_time' | 'balance_due'>('end_time');
  const [sortAsc, setSortAsc] = useState(true);

  // Use a stable 'now' for the render cycle
  const now = useMemo(() => new Date(), []);

  const counts = useMemo(() => {
    const active = allBookings.filter(b => b.status === 'active' || b.status === 'confirmed').length;
    const dueToday = allBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled' && isSameDay(b.end_time, now)).length;
    const overdue = allBookings.filter(b => {
      if (b.status === 'completed' || b.status === 'cancelled') return false;
      const end = new Date(b.end_time);
      return !Number.isNaN(end.getTime()) && end < now;
    }).length;
    const completed = allBookings.filter(b => b.status === 'completed').length;
    return { all: allBookings.length, active, due_today: dueToday, overdue, completed };
  }, [allBookings, now]);

  const filtered = useMemo(() => {
    let list = allBookings;
    if (activeTab === 'active') {
      list = allBookings.filter(b => b.status === 'active' || b.status === 'confirmed');
    } else if (activeTab === 'due_today') {
      list = allBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled' && isSameDay(b.end_time, now));
    } else if (activeTab === 'overdue') {
      list = allBookings.filter(b => {
        if (b.status === 'completed' || b.status === 'cancelled') return false;
        const end = new Date(b.end_time);
        return !Number.isNaN(end.getTime()) && end < now;
      });
    } else if (activeTab === 'completed') {
      list = allBookings.filter(b => b.status === 'completed');
    }

    return [...list].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sortCol === 'customer') {
        valA = a.customer?.firstname || '';
        valB = b.customer?.firstname || '';
      } else if (sortCol === 'vehicle') {
        valA = a.bike?.name || '';
        valB = b.bike?.name || '';
      } else if (sortCol === 'end_time') {
        valA = new Date(a.end_time).getTime();
        valB = new Date(b.end_time).getTime();
      } else if (sortCol === 'balance_due') {
        valA = a.balance_due || 0;
        valB = b.balance_due || 0;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [allBookings, activeTab, sortCol, sortAsc, now]);

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else {
      setSortCol(col);
      setSortAsc(col === 'balance_due' ? false : true);
    }
  };

  const handleSwipeComplete = (booking: RentalBooking) => {
    onSelectBooking?.(booking);
    setTimeout(() => {
      document.getElementById('completion-section')?.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('completion-section')?.querySelector('textarea')?.focus();
    }, 400); // Wait for the drawer animation
  };

  const SortIcon = ({ col }: { col: typeof sortCol }) => {
    if (sortCol !== col) return null;
    return <span className="ml-1">{sortAsc ? '↑' : '↓'}</span>;
  };

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Visual cue for swipe on mobile */}
      <div className="hidden absolute top-0 left-0 text-[10px] text-gray-400 -mt-3 md:block">
        Tip: Swipe active trips right to complete.
      </div>

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

      {loading && allBookings.length === 0 ? (
        <p className="text-center py-6 text-[color:var(--rl-faint)] text-sm">Loading bookings...</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Calendar className="w-6 h-6" />} message="No bookings match this filter." />
      ) : (
        <div className="flex flex-col w-full relative pt-2">
          <div className="flex items-center justify-between mb-4 mt-1">
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

          <div className="flex flex-col">
            {filtered.map((b) => (
              <SwipeableRow
                key={b.id}
                booking={b}
                isSelected={selectedBooking?.id === b.id}
                onClick={() => onSelectBooking?.(b)}
                onSwipeComplete={() => handleSwipeComplete(b)}
                now={now}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
