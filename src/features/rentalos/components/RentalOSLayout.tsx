import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingState } from '../../../components/common/LoadingState';
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';
import Paywall from './Paywall';
import { RentalOSContext, type ManageBookingFocus } from './RentalOSContext';
import type { CatalogVehicle, RentalBooking, RentalOSMe } from '../types';
import { rentalOSErrorMessage, useInvalidateRentalOS, useRentalOSAccess } from '../hooks/useRentalOSQueries';

const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const VehiclesPage = lazy(() => import('../pages/VehiclesPage'));
const BookingsPage = lazy(() => import('../pages/BookingsPage'));
const CustomersPage = lazy(() => import('../pages/CustomersPage'));
const StaffPage = lazy(() => import('../pages/StaffPage'));
const InventoryPage = lazy(() => import('../pages/InventoryPage'));
const CatalogueModal = lazy(() => import('./CatalogueModal'));
const BookingModal = lazy(() => import('./BookingModal'));
const CommandPalette = lazy(() => import('./CommandPalette'));

function RouteFallback() {
  // Return a completely transparent spacer instead of "Loading view..." 
  // so we don't get an ugly text flash when navigating between pages
  return <div className="min-h-[60vh]" />;
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

export default function RentalOSLayout() {
  const location = useLocation();
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
  const bookingModalOpen = Boolean(selectedBooking || selectedVehicle || createBookingOpen);

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
    return <LoadingState type="rentalos" />;
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

  if (activeShop && activeShop.subscription_status !== 'active') {
    return (
      <RentalOSContext.Provider value={contextValue}>
        <div className="rentalos flex h-screen font-sans">
          <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Topbar onMenuClick={() => setMobileSidebarOpen(true)} onOpenCommand={openCommand} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              <Paywall shopName={activeShop.shop_name} />
            </main>
          </div>
          <BottomNav />
        </div>
      </RentalOSContext.Provider>
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
              <Suspense fallback={<RouteFallback />}>
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<PageTransition><DashboardPage /></PageTransition>} />
                    <Route path="/vehicles" element={<PageTransition><VehiclesPage /></PageTransition>} />
                    <Route path="/inventory" element={<PageTransition><InventoryPage /></PageTransition>} />
                    <Route path="/bookings" element={<PageTransition><BookingsPage /></PageTransition>} />
                    <Route path="/customers" element={<PageTransition><CustomersPage /></PageTransition>} />
                    <Route path="/staff" element={<PageTransition><StaffPage /></PageTransition>} />
                    <Route path="*" element={<PageTransition><DashboardPage /></PageTransition>} />
                  </Routes>
                </AnimatePresence>
              </Suspense>
            </div>
          </main>
        </div>

        <BottomNav />
        {catalogueOpen && (
          <Suspense fallback={null}>
            <CatalogueModal />
          </Suspense>
        )}
        {bookingModalOpen && (
          <Suspense fallback={null}>
            <BookingModal />
          </Suspense>
        )}
        {commandOpen && (
          <Suspense fallback={null}>
            <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
          </Suspense>
        )}
      </div>
    </RentalOSContext.Provider>
  );
}
