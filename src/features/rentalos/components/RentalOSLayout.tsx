import { Routes, Route } from 'react-router-dom';
import { createContext, useContext, useEffect, useState } from 'react';
import DashboardPage from '../pages/DashboardPage';
import VehiclesPage from '../pages/VehiclesPage';
import BookingsPage from '../pages/BookingsPage';
import CustomersPage from '../pages/CustomersPage';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CatalogueModal from './CatalogueModal';
import CommandPalette from './CommandPalette';
import { getMe } from '../services/rentalosService';
import type { CatalogVehicle, RentalBooking, RentalOSAccessShop, RentalOSMe } from '../types';

interface RentalOSContextType {
  shopId: number | null;
  activeShop: RentalOSAccessShop | null;
  shops: RentalOSAccessShop[];
  access: RentalOSMe | null;
  isOwner: boolean;
  loadingAccess: boolean;
  setActiveShopId: (shopId: number) => void;
  selectedVehicle: CatalogVehicle | null;
  setSelectedVehicle: (vehicle: CatalogVehicle | null) => void;
  selectedBooking: RentalBooking | null;
  setSelectedBooking: (booking: RentalBooking | null) => void;
  refreshKey: number;
  refreshBookings: () => void;
  catalogueOpen: boolean;
  openCatalogue: () => void;
  closeCatalogue: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  openCommand: () => void;
}

export const RentalOSContext = createContext<RentalOSContextType>({
  shopId: null,
  activeShop: null,
  shops: [],
  access: null,
  isOwner: false,
  loadingAccess: true,
  setActiveShopId: () => undefined,
  selectedVehicle: null,
  setSelectedVehicle: () => undefined,
  selectedBooking: null,
  setSelectedBooking: () => undefined,
  refreshKey: 0,
  refreshBookings: () => undefined,
  catalogueOpen: false,
  openCatalogue: () => undefined,
  closeCatalogue: () => undefined,
  sidebarCollapsed: false,
  toggleSidebar: () => undefined,
  openCommand: () => undefined,
});

export const useRentalOS = () => useContext(RentalOSContext);

export default function RentalOSLayout() {
  const [shopId, setShopId] = useState<number | null>(null);
  const [access, setAccess] = useState<RentalOSMe | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [error, setError] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('rentalos_sidebar_collapsed') === '1';
  });

  const [selectedVehicle, setSelectedVehicle] = useState<CatalogVehicle | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<RentalBooking | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshBookings = () => setRefreshKey((key) => key + 1);
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const openCatalogue = () => setCatalogueOpen(true);
  const closeCatalogue = () => setCatalogueOpen(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const openCommand = () => setCommandOpen(true);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('rentalos_sidebar_collapsed', next ? '1' : '0');
      return next;
    });
  };

  useEffect(() => {
    getMe()
      .then((res) => {
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
      })
      .catch((err) => {
        console.error('Failed to load rentalos staff context', err);
        setError(err.response?.data?.detail || 'Failed to load RentalOS access.');
      })
      .finally(() => setLoadingAccess(false));
  }, []);

  // Keyboard: ⌘K / Ctrl+K to open palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const shops = access ? [...access.owned_shops, ...access.staff_shops] : [];
  const activeShop = shops.find((shop) => shop.shop_id === shopId) || null;
  const isOwner = Boolean(activeShop && access?.owned_shops.some((shop) => shop.shop_id === activeShop.shop_id));

  const setActiveShopId = (nextShopId: number) => {
    setShopId(nextShopId);
    localStorage.setItem('rentalos_shop_id', String(nextShopId));
    setSelectedVehicle(null);
    setSelectedBooking(null);
  };

  if (loadingAccess) {
    return (
      <div className="rentalos min-h-screen flex items-center justify-center text-sm" style={{ color: 'var(--rl-muted)' }}>
        Loading RentalOS…
      </div>
    );
  }

  if (error || !access?.has_rentalos_access) {
    return (
      <div className="rentalos min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md rl-surface rounded-lg p-6 text-center">
          <h1 className="text-lg font-bold mb-2" style={{ color: 'var(--rl-ink)' }}>No RentalOS access</h1>
          <p className="text-sm" style={{ color: 'var(--rl-muted)' }}>
            {error || 'Your account does not have an active RentalOS owner or staff shop.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <RentalOSContext.Provider
      value={{
        shopId,
        activeShop,
        shops,
        access,
        isOwner,
        loadingAccess,
        setActiveShopId,
        selectedVehicle,
        setSelectedVehicle,
        selectedBooking,
        setSelectedBooking,
        refreshKey,
        refreshBookings,
        catalogueOpen,
        openCatalogue,
        closeCatalogue,
        sidebarCollapsed,
        toggleSidebar,
        openCommand,
      }}
    >
      <div className="rentalos flex h-screen font-sans">
        <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuClick={() => setMobileSidebarOpen(true)} onOpenCommand={openCommand} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-5">
            <div className="mx-auto w-full max-w-[1400px]">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/vehicles" element={<VehiclesPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="*" element={<DashboardPage />} />
              </Routes>
            </div>
          </main>
        </div>

        <CatalogueModal />
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      </div>
    </RentalOSContext.Provider>
  );
}
