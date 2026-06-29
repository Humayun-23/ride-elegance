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
      <div className="h-20 flex items-center px-8 border-b border-gray-50 mb-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <CarFront className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-teal-700 tracking-tight">
            RentalOS
          </h2>
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
      
      <nav className="flex-1 px-4 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)] text-gray-800'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${isActive ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30' : 'bg-gray-100'}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl p-4 text-white shadow-lg shadow-teal-500/30">
          <h4 className="font-bold text-sm mb-1">Need help?</h4>
          <p className="text-xs text-white/80 mb-3">Please check our docs</p>
          <button className="w-full bg-white text-teal-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            DOCUMENTATION
          </button>
        </div>
      </div>
    </>
  );
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  return (
    <>
      <aside className="w-[260px] bg-white hidden md:flex flex-col border-r border-gray-100 shadow-[2px_0_24px_rgba(0,0,0,0.02)] z-20 shrink-0">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close RentalOS menu overlay"
            className="absolute inset-0 bg-gray-900/35"
            onClick={onClose}
          />
          <aside className="relative h-full w-[280px] max-w-[85vw] bg-white flex flex-col border-r border-gray-100 shadow-xl">
            <SidebarContent onClose={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
