import { useLocation } from 'react-router-dom';
import { Search, Bell, Settings, UserCircle, Menu } from 'lucide-react';
import { useRentalOS } from './RentalOSLayout';

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const { activeShop, shops, isOwner, setActiveShopId } = useRentalOS();
  const pathName = location.pathname.split('/').pop() || 'Dashboard';
  const pageTitle = pathName.charAt(0).toUpperCase() + pathName.slice(1);

  return (
    <header className="min-h-[75px] bg-white/70 backdrop-blur-xl sticky top-4 z-10 px-3 sm:px-4 flex items-center justify-between gap-3 mx-3 sm:mx-4 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-white/50">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl bg-gray-50 text-gray-700 border border-gray-100"
          aria-label="Open RentalOS menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex min-w-0 flex-col justify-center">
          <div className="text-xs font-semibold text-gray-400 truncate">
            Pages <span className="mx-1">/</span> <span className="text-gray-800">{pageTitle === 'Rentalos' ? 'Dashboard' : pageTitle}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 capitalize truncate">
            {pageTitle === 'Rentalos' ? 'Dashboard' : pageTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {shops.length > 0 && (
          <select
            value={activeShop?.shop_id || ''}
            onChange={(event) => setActiveShopId(Number(event.target.value))}
            className="hidden sm:block bg-gray-50 border border-gray-100 rounded-full px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {shops.map((shop) => (
              <option key={`${shop.role}-${shop.shop_id}`} value={shop.shop_id}>
                {shop.shop_name} ({shop.role})
              </option>
            ))}
          </select>
        )}

        {/* Search Input */}
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search phone or booking ID..." 
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white transition-all w-64 text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2 text-gray-500">
          <span className="hidden lg:inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            {isOwner ? 'Owner' : 'Staff'}
          </span>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors hidden sm:block">
            <UserCircle className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors hidden sm:block">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
