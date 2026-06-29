import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, CarFront, IndianRupee, FileText, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { useRentalOS } from '../components/RentalOSLayout';
import { Card } from '../components/ui';
import { getBookings } from '../services/rentalosService';
import type { RentalBooking } from '../types';

function isDueToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
        </div>
      </div>
    </Card>
  );
}

const QUICK_LINKS = [
  { to: '/rentalos/vehicles', label: 'Check vehicle availability', icon: CarFront },
  { to: '/rentalos/bookings', label: 'Create or manage bookings', icon: FileText },
  { to: '/rentalos/customers', label: 'Look up a customer', icon: Users },
];

export default function DashboardPage() {
  const { activeShop, isOwner, shopId, refreshKey, setSelectedBooking } = useRentalOS();
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    getBookings(shopId)
      .then((res) => setBookings(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [shopId, refreshKey]);

  const activeCount = bookings.filter((b) => b.status === 'active' || b.status === 'confirmed').length;
  const dueTodayCount = bookings.filter((b) => isDueToday(b.end_time)).length;
  const outstanding = bookings.reduce((sum, b) => sum + (b.balance_due > 0 ? b.balance_due : 0), 0);
  const recent = [...bookings].slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{activeShop?.shop_name || 'Your shop'}</h2>
        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-gray-400" />
          Signed in as {isOwner ? 'Owner' : 'Staff'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Active bookings" value={String(activeCount)} icon={<FileText className="w-5 h-5" />} />
        <StatCard label="Due today" value={String(dueTodayCount)} icon={<CalendarClock className="w-5 h-5" />} />
        <StatCard label="Outstanding balance" value={`₹${outstanding.toLocaleString('en-IN')}`} icon={<IndianRupee className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Recent bookings</h3>
            <Link to="/rentalos/bookings" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400 py-6 text-center">Loading...</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recent.map((b) => (
                <li key={b.id}>
                  <Link
                    to="/rentalos/bookings"
                    onClick={() => setSelectedBooking(b)}
                    className="flex items-center justify-between gap-3 py-3 -mx-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {b.customer?.firstname || 'Walk-in'} {b.customer?.lastname || ''}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        #{b.id} · {b.bike?.name || `Bike ${b.bike_id}`} · {b.status}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-semibold ${b.balance_due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{b.balance_due}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(b.end_time).toLocaleDateString()}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Quick actions</h3>
          <div className="space-y-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition-colors group"
              >
                <span className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-white text-gray-500 group-hover:text-teal-600 flex items-center justify-center transition-colors">
                  <link.icon className="w-4 h-4" />
                </span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{link.label}</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 ml-auto" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
