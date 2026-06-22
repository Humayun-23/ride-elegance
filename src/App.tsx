import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import MobileBottomNav from './components/layout/MobileBottomNav';
import Footer from './components/layout/Footer';
import { LoadingState } from './components/common/LoadingState';
import ScrollToTop from './components/common/ScrollToTop';
import { AuthProvider } from './features/auth/context/AuthContext';
import { FavoritesProvider } from './features/vehicles/context/FavoritesContext';
import { GoogleOAuthProvider } from "@react-oauth/google";

// Eagerly load the main entry pages to preserve the index.html Skeleton Shell and protect LCP/CLS
import Index from './pages/Index';
import DynamicLanding from './pages/DynamicLanding';

// Lazy load the rest to reduce bundle size for subsequent navigations
const SearchVehicles = lazy(() => import('./features/vehicles/pages/SearchVehicles'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const VehicleDetail = lazy(() => import('./features/vehicles/pages/VehicleDetail'));
const SavedVehicles = lazy(() => import('./pages/SavedVehicles'));

// Lazy load the remaining pages
const BusinessRentalNetwork = lazy(() => import('./pages/BusinessRentalNetwork'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Shops = lazy(() => import('./features/shops/pages/Shops'));
const ShopDetail = lazy(() => import('./features/shops/pages/ShopDetail'));
const Bookings = lazy(() => import('./features/bookings/pages/Bookings'));
const BookingDetails = lazy(() => import('./features/bookings/pages/BookingDetails'));
const BookingConfirmation = lazy(() => import('./features/bookings/pages/BookingConfirmation'));
const Profile = lazy(() => import('./pages/Profile'));

const ForgotPassword = lazy(() => import('./features/auth/pages/ForgotPassword'));
const PasswordReset = lazy(() => import('./features/auth/pages/PasswordReset'));
const VerifyEmail = lazy(() => import('./features/auth/pages/VerifyEmail'));
const AdminDashboard = lazy(() => import('./features/admin/pages/AdminDashboard'));
const AdminBookings = lazy(() => import('./features/admin/pages/AdminBookings'));
const AdminInventory = lazy(() => import('./features/admin/pages/AdminInventory'));
const AdminReviews = lazy(() => import('./features/admin/pages/AdminReviews'));
const AdminShop = lazy(() => import('./features/admin/pages/AdminShop'));

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "647492306352-ajfb14t9be7ibq8furvfkb25rv3p6jql.apps.googleusercontent.com";

function App() {
  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <FavoritesProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Navbar />
            <Suspense fallback={<LoadingState />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/search-vehicles" element={<SearchVehicles />} />
                <Route path="/business-rental-network" element={<BusinessRentalNetwork />} />
                <Route path="/search/:seoSlug" element={<DynamicLanding />} />
                <Route path="/rent/:vehicleType/in/:city" element={<DynamicLanding />} />
                <Route path="/rent/:vehicleType" element={<DynamicLanding />} />
                <Route path="/shops" element={<Shops />} />
                <Route path="/shops/:id" element={<ShopDetail />} />
                <Route path="/bikes/:id" element={<VehicleDetail />} />
                <Route path="/saved" element={<SavedVehicles />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/bookings/confirmation" element={<BookingConfirmation />} />
                <Route path="/bookings/:id" element={<BookingDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/password-reset" element={<PasswordReset />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                
                {/* Owner Routes */}
                <Route path="/owner/dashboard" element={<AdminDashboard />} />
                <Route path="/owner/shop" element={<AdminShop />} />
                <Route path="/owner/inventory" element={<AdminInventory />} />
                <Route path="/owner/bookings" element={<AdminBookings />} />
                <Route path="/owner/reviews" element={<AdminReviews />} />

                {/* User Specific Routes */}
                <Route path="/users/bookings" element={<Bookings />} />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Footer />
            <MobileBottomNav />
          </BrowserRouter>
        </FavoritesProvider>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}

export default App;
