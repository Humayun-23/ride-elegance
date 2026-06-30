import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CarFront,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  ReceiptText,
  ShieldCheck,
  Users,
  WalletCards,
} from 'lucide-react';
import { useRentalOS } from '../components/RentalOSContext';
import { Card } from '../components/ui';
import type { RentalBooking } from '../types';
import AddVehicleModal from '../components/AddVehicleModal';
import CompleteTripModal from '../components/CompleteTripModal';
import ActiveTripCard from '../components/ActiveTripCard';
import RecordPaymentModal from '../components/RecordPaymentModal';
import { useRentalOSBookings, useRentalOSDashboardSummary } from '../hooks/useRentalOSQueries';

type SortKey = 'customer' | 'vehicle' | 'end_time' | 'balance_due';
type SortDirection = 'asc' | 'desc';
type TimelineEvent = {
  id: string;
  booking: RentalBooking;
  type: 'pickup' | 'return';
  time: Date;
  overdue: boolean;
};

const OPEN_STATUSES = new Set(['active', 'confirmed']);
const CLOSED_STATUSES = new Set(['completed', 'cancelled']);
const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function safeDate(dateStr: string) {
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameDay(dateStr: string, compare: Date) {
  const date = safeDate(dateStr);
  if (!date) return false;
  return date.getFullYear() === compare.getFullYear() && date.getMonth() === compare.getMonth() && date.getDate() === compare.getDate();
}

function isOpenBooking(booking: RentalBooking) {
  return OPEN_STATUSES.has(booking.status);
}

function isClosedBooking(booking: RentalBooking) {
  return CLOSED_STATUSES.has(booking.status);
}

function isOverdue(booking: RentalBooking, now: Date) {
  const end = safeDate(booking.end_time);
  return Boolean(end && isOpenBooking(booking) && end < now);
}

function customerName(booking: RentalBooking) {
  const name = `${booking.customer?.firstname || ''} ${booking.customer?.lastname || ''}`.trim();
  return name || 'Walk-in customer';
}

function vehicleName(booking: RentalBooking) {
  return booking.bike?.name || `Bike ${booking.bike_id}`;
}

function formatTime(dateStr: string) {
  const date = safeDate(dateStr);
  if (!date) return '--:--';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDelta(value: number, money = false) {
  if (value === 0) return 'No change vs yesterday';
  const prefix = value > 0 ? '+' : '-';
  const formatted = money ? `₹${currency.format(Math.abs(value))}` : currency.format(Math.abs(value));
  return `${prefix}${formatted} vs yesterday`;
}

function statusTone(status: string) {
  if (status === 'active') return 'rl-pill-ok';
  if (status === 'confirmed') return 'rl-pill-info';
  if (status === 'completed') return 'rl-pill-mute';
  if (status === 'cancelled') return 'rl-pill-danger';
  return 'rl-pill-warn';
}

function KpiCard({
  label,
  value,
  delta,
  tone = 'default',
  pulsing,
}: {
  label: string;
  value: string;
  delta: string;
  tone?: 'default' | 'danger' | 'warn';
  pulsing: boolean;
}) {
  const toneClass = tone === 'danger' ? 'text-[color:var(--rl-danger)]' : tone === 'warn' ? 'text-[#8a5a10]' : 'text-[color:var(--rl-ink)]';

  return (
    <Card className={`min-h-[92px] px-4 py-3 ${pulsing ? 'rl-metric-pulse' : ''}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--rl-muted)]">{label}</p>
      <p className={`rl-num mt-2 text-2xl font-bold leading-none ${toneClass}`}>{value}</p>
      <p className="mt-2 text-[11px] text-[color:var(--rl-faint)]">{delta}</p>
    </Card>
  );
}

function PanelHeader({ title, meta }: { title: string; meta?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
      <h3 className="text-[13px] font-semibold tracking-tight text-[color:var(--rl-ink)]">{title}</h3>
      {meta && <div className="text-[11px] text-[color:var(--rl-muted)]">{meta}</div>}
    </div>
  );
}

function AttentionItem({
  icon,
  title,
  detail,
  tone = 'default',
  booking,
  onOpen,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  tone?: 'default' | 'danger' | 'warn';
  booking?: RentalBooking;
  onOpen: (booking: RentalBooking) => void;
}) {
  const toneClass = tone === 'danger' ? 'text-[color:var(--rl-danger)]' : tone === 'warn' ? 'text-[#8a5a10]' : 'text-[color:var(--rl-info)]';

  return (
    <button
      type="button"
      onClick={() => booking && onOpen(booking)}
      disabled={!booking}
      className="flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-[color:var(--rl-hover)] disabled:cursor-default disabled:hover:bg-transparent"
    >
      <span className={`mt-0.5 ${toneClass}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-[color:var(--rl-ink)]">{title}</span>
        <span className="block truncate text-[12px] text-[color:var(--rl-muted)]">{detail}</span>
      </span>
    </button>
  );
}

export default function DashboardPage() {
  const { activeShop, isOwner, shopId, refreshBookings, setSelectedBooking } = useRentalOS();
  const {
    data: bookings = [],
    isLoading: loading,
    isFetching,
    dataUpdatedAt,
  } = useRentalOSBookings(shopId, undefined, { refetchInterval: 30000 });
  const {
    data: summary,
    isFetching: isFetchingSummary,
    dataUpdatedAt: summaryUpdatedAt,
  } = useRentalOSDashboardSummary(shopId, { refetchInterval: 30000 });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [metricPulse, setMetricPulse] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('end_time');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [completeBookingData, setCompleteBookingData] = useState<RentalBooking | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<RentalBooking | null>(null);

  useEffect(() => {
    const latestUpdatedAt = Math.max(dataUpdatedAt || 0, summaryUpdatedAt || 0);
    if (!latestUpdatedAt) return;
    const refreshedAt = new Date(latestUpdatedAt);
    setLastUpdated(refreshedAt);
    setCurrentTime(refreshedAt);
    setMetricPulse(true);
    const pulseTimer = window.setTimeout(() => setMetricPulse(false), 700);
    return () => window.clearTimeout(pulseTimer);
  }, [dataUpdatedAt, summaryUpdatedAt]);

  const now = currentTime;

  const dashboard = useMemo(() => {
    const active = bookings.filter(isOpenBooking);
    const overdue = active.filter((booking) => isOverdue(booking, now));

    const activeTripsDueToday = active.filter((b) => {
      const end = safeDate(b.end_time);
      if (!end) return false;
      return isSameDay(b.end_time, now) || end < now;
    });

    const timeline = bookings
      .filter((booking) => !isClosedBooking(booking))
      .flatMap<TimelineEvent>((booking) => {
        const pickup = safeDate(booking.start_time);
        const drop = safeDate(booking.end_time);
        const events: TimelineEvent[] = [];
        if (pickup && isSameDay(booking.start_time, now)) {
          events.push({ id: `${booking.id}-pickup`, booking, type: 'pickup', time: pickup, overdue: false });
        }
        if (drop && isSameDay(booking.end_time, now)) {
          events.push({ id: `${booking.id}-return`, booking, type: 'return', time: drop, overdue: isOverdue(booking, now) });
        }
        return events;
      })
      .sort((a, b) => Number(b.overdue) - Number(a.overdue) || a.time.getTime() - b.time.getTime());

    const timelineGroups = timeline.reduce<Array<{ hour: string; events: TimelineEvent[] }>>((groups, event) => {
      const hour = event.overdue ? 'Overdue' : event.time.toLocaleTimeString('en-IN', { hour: '2-digit' });
      const existing = groups.find((group) => group.hour === hour);
      if (existing) {
        existing.events.push(event);
      } else {
        groups.push({ hour, events: [event] });
      }
      return groups;
    }, []);

    const sortedActiveTrips = [...activeTripsDueToday].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortKey === 'balance_due') return ((a.balance_due || 0) - (b.balance_due || 0)) * direction;
      if (sortKey === 'end_time') return (new Date(a.end_time).getTime() - new Date(b.end_time).getTime()) * direction;
      const left = sortKey === 'customer' ? customerName(a) : vehicleName(a);
      const right = sortKey === 'customer' ? customerName(b) : vehicleName(b);
      return left.localeCompare(right) * direction;
    });

    const flagged = bookings.filter((booking) => booking.customer?.current_flag_status);
    const unpaid = bookings
      .filter((booking) => booking.balance_due > 0 && !overdue.some((item) => item.id === booking.id))
      .sort((a, b) => b.balance_due - a.balance_due);

    return {
      overdue,
      timeline,
      timelineGroups,
      activeTrips: sortedActiveTrips,
      attention: {
        overdue: overdue.slice(0, 3),
        unpaid: unpaid.slice(0, 3),
        flagged: flagged.slice(0, 2),
        documentChecks: active.slice(0, 2),
      },
    };
  }, [bookings, now, sortDirection, sortKey]);

  const kpiSyncing = !summary;
  const kpiValue = (value: number, money = false) => {
    if (kpiSyncing) return '...';
    const formatted = currency.format(value);
    return money ? `₹${formatted}` : formatted;
  };
  const kpiDelta = (value: number, money = false) => (kpiSyncing ? 'Syncing' : formatDelta(value, money));

  const openBooking = (booking: RentalBooking) => {
    setSelectedBooking(booking);
  };

  const toggleSort = (nextKey: SortKey) => {
    if (sortKey === nextKey) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(nextKey);
    setSortDirection(nextKey === 'balance_due' ? 'desc' : 'asc');
  };

  const sortLabel = (key: SortKey) => (sortKey === key ? (sortDirection === 'asc' ? '↑' : '↓') : '');

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[color:var(--rl-ink)]">{activeShop?.shop_name || 'Rental desk'}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[color:var(--rl-muted)]">
            <ShieldCheck className="h-4 w-4 text-[color:var(--rl-faint)]" />
            Signed in as {isOwner ? 'Owner' : 'Staff'}
          </p>
        </div>
        <p className="rl-num flex items-center gap-1.5 text-[11px] text-[color:var(--rl-faint)]">
          {isFetching || isFetchingSummary ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock3 className="h-3.5 w-3.5" />}
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Syncing'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Active" value={kpiValue(summary?.active_count || 0)} delta={kpiDelta(summary?.active_delta || 0)} pulsing={metricPulse} />
        <KpiCard label="Due today" value={kpiValue(summary?.due_today_count || 0)} delta={kpiDelta(summary?.due_today_delta || 0)} tone="warn" pulsing={metricPulse} />
        <KpiCard label="Overdue" value={kpiValue(summary?.overdue_count || 0)} delta={kpiDelta(summary?.overdue_delta || 0)} tone="danger" pulsing={metricPulse} />
        <KpiCard label="Outstanding" value={kpiValue(summary?.outstanding || 0, true)} delta={kpiDelta(summary?.outstanding_delta || 0, true)} tone={(summary?.outstanding || 0) > 0 ? 'warn' : 'default'} pulsing={metricPulse} />
        <KpiCard label="Today's revenue" value={kpiValue(summary?.today_revenue || 0, true)} delta={kpiDelta(summary?.revenue_delta || 0, true)} pulsing={metricPulse} />
      </div>

      {/* Active Bookings Due Today Section */}
      <div className="mt-2 mb-6">
        <div className="mb-4">
          <h2 className="text-[18px] font-bold text-[color:var(--rl-ink)]">Active Bookings Due Today</h2>
          <p className="text-[13px] text-[color:var(--rl-muted)]">Mark returned vehicles as completed and make them available again.</p>
        </div>
        
        {loading && bookings.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-[color:var(--rl-faint)]">Loading trips...</p>
        ) : dashboard.activeTrips.length === 0 ? (
          <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[200px]">
            <CheckCircle2 className="w-10 h-10 text-[#3bb881] mb-3 opacity-80" />
            <h3 className="font-bold text-[15px] text-[color:var(--rl-ink)]">All clear. No active bookings due today.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dashboard.activeTrips.map((booking) => (
              <ActiveTripCard 
                key={booking.id} 
                booking={booking} 
                onRecordPayment={setPaymentBooking} 
                onCompleteTrip={(b) => setCompleteBookingData(b)} 
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <PanelHeader title="Today's timeline" meta={`${dashboard.timeline.length} events`} />
          <div className="max-h-[560px] overflow-y-auto">
            {loading && bookings.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-[color:var(--rl-faint)]">Loading timeline...</p>
            ) : dashboard.timeline.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-[color:var(--rl-faint)]">No pickups or returns today.</p>
            ) : (
              <div className="divide-y">
                {dashboard.timelineGroups.map((group) => (
                  <div key={group.hour}>
                    <div className={`sticky top-0 z-[1] border-b px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${group.hour === 'Overdue' ? 'bg-[color:var(--rl-danger-soft)] text-[color:var(--rl-danger)]' : 'bg-white text-[color:var(--rl-muted)]'}`}>
                      {group.hour}
                    </div>
                    {group.events.map((event) => (
                      <button
                        type="button"
                        key={event.id}
                        onClick={() => openBooking(event.booking)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[color:var(--rl-hover)] ${event.overdue ? 'bg-[color:var(--rl-danger-soft)]/60' : ''}`}
                      >
                        <span className={`rl-num w-14 shrink-0 text-[12px] font-semibold ${event.overdue ? 'text-[color:var(--rl-danger)]' : 'text-[color:var(--rl-muted)]'}`}>
                          {formatTime(event.time.toISOString())}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className={`rl-pill ${event.type === 'pickup' ? 'rl-pill-info' : event.overdue ? 'rl-pill-danger' : 'rl-pill-warn'}`}>
                              {event.overdue ? 'Overdue' : event.type}
                            </span>
                            <span className="rl-num text-[10px] text-[color:var(--rl-faint)]">#{event.booking.id}</span>
                          </span>
                          <span className="mt-1 block truncate text-[13px] font-semibold text-[color:var(--rl-ink)]">{customerName(event.booking)}</span>
                          <span className="block truncate text-[12px] text-[color:var(--rl-muted)]">{vehicleName(event.booking)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>



        <div className="space-y-4">
          <Card className="overflow-hidden">
            <PanelHeader title="Quick actions" />
            <div className="grid grid-cols-1 divide-y">
              <Link to="/rentalos/bookings" className="flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[color:var(--rl-ink)] transition-colors hover:bg-[color:var(--rl-hover)]">
                <FileText className="h-4 w-4 text-[color:var(--rl-brand-deep)]" />
                New walk-in booking
                <ArrowRight className="ml-auto h-4 w-4 text-[color:var(--rl-faint)]" />
              </Link>
              <Link to="/rentalos/vehicles" className="flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[color:var(--rl-ink)] transition-colors hover:bg-[color:var(--rl-hover)]">
                <CarFront className="h-4 w-4 text-[color:var(--rl-info)]" />
                Check availability
                <ArrowRight className="ml-auto h-4 w-4 text-[color:var(--rl-faint)]" />
              </Link>
              <Link to="/rentalos/customers" className="flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[color:var(--rl-ink)] transition-colors hover:bg-[color:var(--rl-hover)]">
                <Users className="h-4 w-4 text-[color:var(--rl-muted)]" />
                Phone lookup
                <ArrowRight className="ml-auto h-4 w-4 text-[color:var(--rl-faint)]" />
              </Link>
              {isOwner && (
                <div className="px-4 py-3">
                  <AddVehicleModal />
                </div>
              )}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <PanelHeader title="Needs attention" meta={`${dashboard.attention.overdue.length + dashboard.attention.unpaid.length + dashboard.attention.flagged.length} urgent`} />
            <div>
              {dashboard.attention.overdue.map((booking) => (
                <AttentionItem
                  key={`overdue-${booking.id}`}
                  icon={<AlertTriangle className="h-4 w-4" />}
                  title="Overdue return"
                  detail={`${customerName(booking)} · ${vehicleName(booking)} · due ${formatTime(booking.end_time)}`}
                  tone="danger"
                  booking={booking}
                  onOpen={openBooking}
                />
              ))}
              {dashboard.attention.unpaid.map((booking) => (
                <AttentionItem
                  key={`unpaid-${booking.id}`}
                  icon={<WalletCards className="h-4 w-4" />}
                  title={`₹${currency.format(booking.balance_due)} unpaid`}
                  detail={`${customerName(booking)} · ${vehicleName(booking)}`}
                  tone="warn"
                  booking={booking}
                  onOpen={openBooking}
                />
              ))}
              {dashboard.attention.flagged.map((booking) => (
                <AttentionItem
                  key={`flagged-${booking.id}`}
                  icon={<AlertTriangle className="h-4 w-4" />}
                  title="Customer flagged"
                  detail={`${customerName(booking)} · ${booking.customer?.current_flag_status}`}
                  tone="danger"
                  booking={booking}
                  onOpen={openBooking}
                />
              ))}
              {dashboard.attention.documentChecks.map((booking) => (
                <AttentionItem
                  key={`docs-${booking.id}`}
                  icon={<ReceiptText className="h-4 w-4" />}
                  title="Verify DL / ID upload"
                  detail={`${customerName(booking)} · open handover workflow`}
                  booking={booking}
                  onOpen={openBooking}
                />
              ))}
              {dashboard.attention.overdue.length === 0 &&
                dashboard.attention.unpaid.length === 0 &&
                dashboard.attention.flagged.length === 0 &&
                dashboard.attention.documentChecks.length === 0 && (
                  <div className="flex items-center gap-3 px-4 py-5 text-[13px] text-[color:var(--rl-muted)]">
                    <CheckCircle2 className="h-4 w-4 text-[color:var(--rl-brand-deep)]" />
                    Counter is clear.
                  </div>
                )}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 h-4 w-4 text-[color:var(--rl-faint)]" />
              <div>
                <p className="text-[13px] font-semibold text-[color:var(--rl-ink)]">Shift context</p>
                <p className="mt-1 text-[12px] text-[color:var(--rl-muted)]">
                  Timeline is grouped to today. Overdue returns stay pinned at the top until completed.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <CompleteTripModal 
        booking={completeBookingData}
        isOpen={completeBookingData !== null}
        onClose={() => setCompleteBookingData(null)}
        onComplete={() => {
          setCompleteBookingData(null);
          refreshBookings();
        }}
        onRecordPayment={(booking) => {
          setCompleteBookingData(null);
          setPaymentBooking(booking);
        }}
      />
      <RecordPaymentModal
        booking={paymentBooking}
        isOpen={paymentBooking !== null}
        onClose={() => setPaymentBooking(null)}
        onRecorded={refreshBookings}
      />
    </div>
  );
}
