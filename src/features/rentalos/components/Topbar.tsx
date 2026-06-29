import { useLocation } from 'react-router-dom';
import { Bell, Menu, LayoutGrid } from 'lucide-react';
import { useRentalOS } from './RentalOSLayout';

interface TopbarProps {
  onMenuClick?: () => void;
}

const TITLES: Record<string, string> = {
  vehicles: 'Vehicles',
  bookings: 'Bookings',
  customers: 'Customers',
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const { activeShop, shops, isOwner, setActiveShopId, openCatalogue } = useRentalOS();
  const last = location.pathname.split('/').pop() || '';
  const pageTitle = TITLES[last] || 'Dashboard';

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-10 px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
          aria-label="Open RentalOS menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 truncate">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={openCatalogue}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-teal-600 text-white text-xs sm:text-sm font-semibold hover:bg-teal-700 transition-colors"
          aria-label="Open vehicle catalogue"
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Catalogue</span>
        </button>

        {shops.length > 0 && (
          <select
            value={activeShop?.shop_id || ''}
            onChange={(event) => setActiveShopId(Number(event.target.value))}
            className="hidden sm:block max-w-[150px] sm:max-w-none bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
          >
            {shops.map((shop) => (
              <option key={`${shop.role}-${shop.shop_id}`} value={shop.shop_id}>
                {shop.shop_name} ({shop.role})
              </option>
            ))}
          </select>
        )}

        <span className="hidden sm:inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
          {isOwner ? 'Owner' : 'Staff'}
        </span>

        <button
          type="button"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
