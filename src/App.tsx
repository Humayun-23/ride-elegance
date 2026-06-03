import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import WhatsAppButton from './components/WhatsAppButton';
import { AuthProvider } from './contexts/AuthContext';

// Eagerly load the main entry pages to preserve the index.html Skeleton Shell and protect LCP/CLS
import Index from './pages/Index';
import DynamicLanding from './pages/DynamicLanding';

// Lazy load the rest to reduce bundle size for subsequent navigations
const SearchVehicles = lazy(() => import('./pages/SearchVehicles'));
const Login = lazy(() => import('./pages/Login'));
const VehicleDetail = lazy(() => import('./pages/VehicleDetail'));

// Lazy load the remaining pages
const NotFound = lazy(() => import('./pages/NotFound'));
const Shops = lazy(() => import('./pages/Shops'));
const ShopDetail = lazy(() => import('./pages/ShopDetail'));
const Bookings = lazy(() => import('./pages/Bookings'));
const BookingDetails = lazy(() => import('./pages/BookingDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const PasswordReset = lazy(() => import('./pages/PasswordReset'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminBookings = lazy(() => import('./pages/AdminBookings'));
const AdminInventory = lazy(() => import('./pages/AdminInventory'));
const AdminReviews = lazy(() => import('./pages/AdminReviews'));
const AdminShop = lazy(() => import('./pages/AdminShop'));

// A reusable loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-primary font-medium">Loading...</div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <WhatsAppButton />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search-vehicles" element={<SearchVehicles />} />
            <Route path="/search/:seoSlug" element={<DynamicLanding />} />
            <Route path="/rent/:vehicleType/in/:city" element={<DynamicLanding />} />
            <Route path="/rent/:vehicleType" element={<DynamicLanding />} />
            <Route path="/shops" element={<Shops />} />
            <Route path="/shops/:id" element={<ShopDetail />} />
            <Route path="/bikes/:id" element={<VehicleDetail />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/bookings/:id" element={<BookingDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
