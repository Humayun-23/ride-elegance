import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CarFront, Users, FileText, Plus } from 'lucide-react';
import { useRentalOS } from './RentalOSContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/rentalos', icon: LayoutDashboard },
  { name: 'Bookings', path: '/rentalos/bookings', icon: FileText },
];

const RIGHT_NAV_ITEMS = [
  { name: 'Vehicles', path: '/rentalos/vehicles', icon: CarFront },
  { name: 'Customers', path: '/rentalos/customers', icon: Users },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setSelectedBooking } = useRentalOS();

  const handleNew = () => {
    setSelectedBooking(null);
    navigate('/rentalos/bookings?new=1');
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t z-50 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]" style={{ borderColor: 'var(--rl-border)' }}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.path === '/rentalos' ? pathname === '/rentalos' : pathname.startsWith(item.path);
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center min-w-[3rem] h-full gap-1 transition-colors ${isActive ? 'text-[color:var(--rl-brand-deep)]' : 'text-[color:var(--rl-muted)]'
              }`}
          >
            <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}

      <div className="relative -top-5 flex justify-center w-16">
        <button
          onClick={handleNew}
          className="w-14 h-14 bg-[color:var(--rl-brand)] rounded-full flex items-center justify-center shadow-lg text-[color:var(--rl-ink)] hover:scale-105 transition-transform"
          style={{ boxShadow: '0 4px 14px 0 rgba(59, 184, 129, 0.39)' }}
        >
          <Plus className="w-7 h-7 stroke-[2.5px]" />
        </button>
      </div>

      {RIGHT_NAV_ITEMS.map((item) => {
        const isActive = item.path === '/rentalos' ? pathname === '/rentalos' : pathname.startsWith(item.path);
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center min-w-[3rem] h-full gap-1 transition-colors ${isActive ? 'text-[color:var(--rl-brand-deep)]' : 'text-[color:var(--rl-muted)]'
              }`}
          >
            <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}

    </div>
  );
}
