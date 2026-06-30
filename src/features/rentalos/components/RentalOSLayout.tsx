import { Routes, Route } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardPage from '../pages/DashboardPage';
import VehiclesPage from '../pages/VehiclesPage';
import BookingsPage from '../pages/BookingsPage';
import CustomersPage from '../pages/CustomersPage';
import StaffPage from '../pages/StaffPage';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CatalogueModal from './CatalogueModal';
import CommandPalette from './CommandPalette';
import BottomNav from './BottomNav';
import BookingModal from './BookingModal';
import { RentalOSContext, type ManageBookingFocus } from './RentalOSContext';
import type { CatalogVehicle, RentalBooking, RentalOSMe } from '../types';
import { rentalOSErrorMessage, useInvalidateRentalOS, useRentalOSAccess } from '../hooks/useRentalOSQueries';

export default function RentalOSLayout() {
  const [shopId, setShopId] = useState<number | null>(null);
  const [access, setAccess] = useState<RentalOSMe | null>(null);
  const [error, setError] = useState('');
  const { data: accessData, error: accessError, isLoading: loadingAccess } = useRentalOSAccess();
  const invalidateRentalOS = useInvalidateRentalOS();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const [createBookingOpen, setCreateBookingOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('rentalos_sidebar_collapsed') === '1';
  });

  const [selectedVehicle, setSelectedVehicle] = useState<CatalogVehicle | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<RentalBooking | null>(null);
  const [manageBookingFocus, setManageBookingFocus] = useState<ManageBookingFocus>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshBookings = useCallback(() => {
    invalidateRentalOS(shopId);
    setRefreshKey((key) => key + 1);
  }, [invalidateRentalOS, shopId]);
  const openCatalogue = useCallback(() => setCatalogueOpen(true), []);
  const closeCatalogue = useCallback(() => setCatalogueOpen(false), []);
  const [commandOpen, setCommandOpen] = useState(false);
  const openCommand = useCallback(() => setCommandOpen(true), []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('rentalos_sidebar_collapsed', next ? '1' : '0');
      return next;
    });
  }, []);

  useEffect(() => {
    if (!accessData) return;

    const availableShops = [...accessData.owned_shops, ...accessData.staff_shops];
    const storedShopId = Number(localStorage.getItem('rentalos_shop_id'));
    const selectedShop = availableShops.find((shop) => shop.shop_id === storedShopId) || availableShops[0];

    setAccess(accessData);
    setError('');
    if (selectedShop) {
      setShopId(selectedShop.shop_id);
      localStorage.setItem('rentalos_shop_id', String(selectedShop.shop_id));
    } else {
      setShopId(null);
      localStorage.removeItem('rentalos_shop_id');
    }
  }, [accessData]);

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

  const shops = useMemo(() => (access ? [...access.owned_shops, ...access.staff_shops] : []), [access]);
  const activeShop = useMemo(() => shops.find((shop) => shop.shop_id === shopId) || null, [shopId, shops]);
  const isOwner = useMemo(
    () => Boolean(activeShop && access?.owned_shops.some((shop) => shop.shop_id === activeShop.shop_id)),
    [access, activeShop],
  );

  const setActiveShopId = useCallback((nextShopId: number) => {
    setShopId(nextShopId);
    localStorage.setItem('rentalos_shop_id', String(nextShopId));
    setSelectedVehicle(null);
    setSelectedBooking(null);
    setManageBookingFocus(null);
  }, []);

  const accessErrorMessage = accessError
    ? rentalOSErrorMessage(accessError, 'Failed to load RentalOS access.')
    : '';

  const contextValue = useMemo(
    () => ({
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
      manageBookingFocus,
      setManageBookingFocus,
      refreshKey,
      refreshBookings,
      catalogueOpen,
      openCatalogue,
      closeCatalogue,
      sidebarCollapsed,
      toggleSidebar,
      openCommand,
      createBookingOpen,
      setCreateBookingOpen,
    }),
    [
      access,
      activeShop,
      catalogueOpen,
      closeCatalogue,
      createBookingOpen,
      isOwner,
      loadingAccess,
      manageBookingFocus,
      openCatalogue,
      openCommand,
      refreshBookings,
      refreshKey,
      selectedBooking,
      selectedVehicle,
      setActiveShopId,
      shopId,
      shops,
      sidebarCollapsed,
      toggleSidebar,
    ],
  );

  if (loadingAccess) {
    return (
      <div className="rentalos min-h-screen flex items-center justify-center text-sm" style={{ color: 'var(--rl-muted)' }}>
        Loading RentalOS…
      </div>
    );
  }

  if (error || accessErrorMessage || !access?.has_rentalos_access) {
    return (
      <div className="rentalos min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md rl-surface rounded-lg p-6 text-center">
          <h1 className="text-lg font-bold mb-2" style={{ color: 'var(--rl-ink)' }}>No RentalOS access</h1>
          <p className="text-sm" style={{ color: 'var(--rl-muted)' }}>
            {error || accessErrorMessage || 'Your account does not have an active RentalOS owner or staff shop.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <RentalOSContext.Provider value={contextValue}>
      <div className="rentalos flex h-screen font-sans">
        <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuClick={() => setMobileSidebarOpen(true)} onOpenCommand={openCommand} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-5 pb-20 md:pb-5">
            <div className="mx-auto w-full max-w-[1400px]">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/vehicles" element={<VehiclesPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/staff" element={<StaffPage />} />
                <Route path="*" element={<DashboardPage />} />
              </Routes>
            </div>
          </main>
        </div>

        <BottomNav />
        <CatalogueModal />
        <BookingModal />
        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      </div>
    </RentalOSContext.Provider>
  );
}
