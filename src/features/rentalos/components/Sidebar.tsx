import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CarFront, Users, FileText, X } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/rentalos', icon: LayoutDashboard },
  { name: 'Vehicles', path: '/rentalos/vehicles', icon: CarFront },
  { name: 'Bookings', path: '/rentalos/bookings', icon: FileText },
  { name: 'Customers', path: '/rentalos/customers', icon: Users },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const location = useLocation();

  return (
    <>
      <div className="h-16 flex items-center px-5 border-b border-gray-200">
        <div className="flex flex-1 items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <CarFront className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">RentalOS</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          aria-label="Close RentalOS menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
          <h4 className="font-semibold text-sm text-gray-900 mb-1">Need help?</h4>
          <p className="text-xs text-gray-500 mb-3">Check the documentation for setup and workflows.</p>
          <button className="w-full bg-emerald-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-emerald-700 transition-colors">
            Documentation
          </button>
        </div>
      </div>
    </>
  );
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  return (
    <>
      <aside className="w-64 bg-white hidden md:flex flex-col border-r border-gray-200 shrink-0">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close RentalOS menu overlay"
            className="absolute inset-0 bg-gray-900/40"
            onClick={onClose}
          />
          <aside className="relative h-full w-72 max-w-[85vw] bg-white flex flex-col border-r border-gray-200 shadow-xl">
            <SidebarContent onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
