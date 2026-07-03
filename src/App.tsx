import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { LoadingState } from './components/common/LoadingState';
import ScrollToTop from './components/common/ScrollToTop';
import { AuthProvider } from './features/auth/context/AuthContext';
import { FavoritesProvider } from './features/vehicles/context/FavoritesContext';
import { GoogleOAuthProvider } from "@react-oauth/google";

// Eagerly load the main entry pages to preserve the index.html Skeleton Shell and protect LCP/CLS
import Index from './pages/Index';
import DynamicLanding from './pages/DynamicLanding';

// Lazy load RentalOS
const RentalOSLayout = lazy(() => import('./features/rentalos/components/RentalOSLayout'));

// Lazy load the rest to reduce bundle size for subsequent navigations
const SearchVehicles = lazy(() => import('./features/vehicles/pages/SearchVehicles'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const VehicleDetail = lazy(() => import('./features/vehicles/pages/VehicleDetail'));
const SavedVehicles = lazy(() => import('./pages/SavedVehicles'));

// Lazy load the remaining pages
const BusinessRentalNetwork = lazy(() => import('./pages/BusinessRentalNetwork'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const MarkdownPage = lazy(() => import('./pages/MarkdownPage'));

const AboutUs = lazy(() => import('./pages/AboutUs'));
import blogTravelGuidesContent from './content/blog-travel-guides.md?raw';
import cancellationPolicyContent from './content/cancellation-and-refund-policy.md?raw';
import faqContent from './content/faq-help-center.md?raw';
import partnerWithUsContent from './content/partner-with-us.md?raw';
import privacyPolicyContent from './content/privacy-policy.md?raw';
import rentalPartnerTermsContent from './content/rental-partner-terms.md?raw';
import rentalosDataContent from './content/rentalos-data-handling.md?raw';
import termsContent from './content/terms-and-conditions.md?raw';
import trustAndSafetyContent from './content/trust-and-safety.md?raw';
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
  useEffect(() => {
    // Clean up the index.html initialization class once React boots up
    document.documentElement.classList.remove('rentalos-init');
  }, []);

  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <FavoritesProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* RentalOS Sub-App */}
              <Route path="/rentalos/*" element={
                <Suspense fallback={<LoadingState type="rentalos" />}>
                  <RentalOSLayout />
                </Suspense>
              } />

              {/* Public Sub-App */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/search-vehicles" element={<SearchVehicles />} />
                <Route path="/business-rental-network" element={<BusinessRentalNetwork />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/search/:seoSlug" element={<DynamicLanding />} />
                <Route path="/rent/:vehicleType/in/:city" element={<DynamicLanding />} />
                <Route path="/rent/:vehicleType" element={<DynamicLanding />} />
                
                {/* Legal and Content Pages */}
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/blog-travel-guides" element={<MarkdownPage title="Blog & Travel Guides" content={blogTravelGuidesContent} />} />
                <Route path="/cancellation-and-refund-policy" element={<MarkdownPage title="Cancellation and Refund Policy" content={cancellationPolicyContent} />} />
                <Route path="/faq-help-center" element={<MarkdownPage title="FAQ & Help Center" content={faqContent} />} />
                <Route path="/partner-with-us" element={<MarkdownPage title="Partner With Us" content={partnerWithUsContent} />} />
                <Route path="/privacy-policy" element={<MarkdownPage title="Privacy Policy" content={privacyPolicyContent} />} />
                <Route path="/rental-partner-terms" element={<MarkdownPage title="Rental Partner Terms" content={rentalPartnerTermsContent} />} />
                <Route path="/rentalos-data-handling" element={<MarkdownPage title="RentalOS Data Handling" content={rentalosDataContent} />} />
                <Route path="/terms-and-conditions" element={<MarkdownPage title="Terms and Conditions" content={termsContent} />} />
                <Route path="/trust-and-safety" element={<MarkdownPage title="Trust and Safety" content={trustAndSafetyContent} />} />

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
              </Route>
            </Routes>
          </BrowserRouter>
        </FavoritesProvider>
      </GoogleOAuthProvider>
    </AuthProvider>
  );
}

export default App;
