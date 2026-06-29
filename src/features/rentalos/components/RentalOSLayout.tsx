import { Routes, Route } from 'react-router-dom';
import { createContext, useContext, useEffect, useState } from 'react';
import DashboardPage from '../pages/DashboardPage';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { getMe } from '../services/rentalosService';
import type { RentalOSAccessShop, RentalOSMe } from '../types';

interface RentalOSContextType {
  shopId: number | null;
  activeShop: RentalOSAccessShop | null;
  shops: RentalOSAccessShop[];
  access: RentalOSMe | null;
  isOwner: boolean;
  loadingAccess: boolean;
  setActiveShopId: (shopId: number) => void;
}
export const RentalOSContext = createContext<RentalOSContextType>({
  shopId: null,
  activeShop: null,
  shops: [],
  access: null,
  isOwner: false,
  loadingAccess: true,
  setActiveShopId: () => undefined,
});

export const useRentalOS = () => useContext(RentalOSContext);

export default function RentalOSLayout() {
  const [shopId, setShopId] = useState<number | null>(null);
  const [access, setAccess] = useState<RentalOSMe | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [error, setError] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    getMe().then((res) => {
      const nextAccess = res.data;
      const availableShops = [...nextAccess.owned_shops, ...nextAccess.staff_shops];
      const storedShopId = Number(localStorage.getItem('rentalos_shop_id'));
      const selectedShop = availableShops.find((shop) => shop.shop_id === storedShopId) || availableShops[0];

      setAccess(nextAccess);
      if (selectedShop) {
        setShopId(selectedShop.shop_id);
        localStorage.setItem('rentalos_shop_id', String(selectedShop.shop_id));
      } else {
        setShopId(null);
        localStorage.removeItem('rentalos_shop_id');
      }
    }).catch(err => {
      console.error("Failed to load rentalos staff context", err);
      setError(err.response?.data?.detail || 'Failed to load RentalOS access.');
    }).finally(() => setLoadingAccess(false));
  }, []);

  const shops = access ? [...access.owned_shops, ...access.staff_shops] : [];
  const activeShop = shops.find((shop) => shop.shop_id === shopId) || null;
  const isOwner = Boolean(activeShop && access?.owned_shops.some((shop) => shop.shop_id === activeShop.shop_id));

  const setActiveShopId = (nextShopId: number) => {
    setShopId(nextShopId);
    localStorage.setItem('rentalos_shop_id', String(nextShopId));
  };

  if (loadingAccess) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-gray-500">
        Loading RentalOS access...
      </div>
    );
  }

  if (error || !access?.has_rentalos_access) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="max-w-md bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-2">No RentalOS access</h1>
          <p className="text-sm text-gray-500">
            {error || 'Your account does not have an active RentalOS owner or staff shop.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <RentalOSContext.Provider value={{ shopId, activeShop, shops, access, isOwner, loadingAccess, setActiveShopId }}>
      <div className="flex h-screen bg-[#F8F9FA] text-[#2D3748] font-sans">
        <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />

          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-3 sm:p-6 pt-6 sm:pt-8">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="*" element={<DashboardPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </RentalOSContext.Provider>
  );
}
