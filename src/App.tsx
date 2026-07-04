import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoadingState } from './components/common/LoadingState';
import ScrollToTop from './components/common/ScrollToTop';
import { AuthProvider } from './features/auth/context/AuthContext';
import { FavoritesProvider } from './features/vehicles/context/FavoritesContext';
import { GoogleOAuthProvider } from "@react-oauth/google";

const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const Index = lazy(() => import('./pages/Index'));
const DynamicLanding = lazy(() => import('./pages/DynamicLanding'));
const DemoEntry = lazy(() => import('./pages/DemoEntry'));

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
const AboutUs = lazy(() => import('./pages/AboutUs'));

const createMarkdownRoute = (title: string, importFunc: () => Promise<any>) => {
  return lazy(async () => {
    const [MarkdownPageModule, contentModule] = await Promise.all([
      import('./pages/MarkdownPage'),
      importFunc()
    ]);
    const MarkdownPage = MarkdownPageModule.default;
    return {
      default: (props: any) => <MarkdownPage title={title} content={contentModule.default} {...props} />
    };
  });
};

const BlogTravelGuides = createMarkdownRoute('Blog & Travel Guides', () => import('./content/blog-travel-guides.md?raw'));
const CancellationPolicy = createMarkdownRoute('Cancellation and Refund Policy', () => import('./content/cancellation-and-refund-policy.md?raw'));
const FaqHelpCenter = createMarkdownRoute('FAQ & Help Center', () => import('./content/faq-help-center.md?raw'));
const PartnerWithUs = createMarkdownRoute('Partner With Us', () => import('./content/partner-with-us.md?raw'));
const PrivacyPolicy = createMarkdownRoute('Privacy Policy', () => import('./content/privacy-policy.md?raw'));
const RentalPartnerTerms = createMarkdownRoute('Rental Partner Terms', () => import('./content/rental-partner-terms.md?raw'));
const RentalosDataHandling = createMarkdownRoute('RentalOS Data Handling', () => import('./content/rentalos-data-handling.md?raw'));
const TermsAndConditions = createMarkdownRoute('Terms and Conditions', () => import('./content/terms-and-conditions.md?raw'));
const TrustAndSafety = createMarkdownRoute('Trust and Safety', () => import('./content/trust-and-safety.md?raw'));
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
      <FavoritesProvider>
        <BrowserRouter>
          <ScrollToTop />
            <Routes>
              {/* RentalOS Demo Entry — one-click demo login, no auth required */}
              <Route path="/rentalos/demo" element={
                <Suspense fallback={<LoadingState type="rentalos" />}>
                  <DemoEntry />
                </Suspense>
              } />

              {/* RentalOS Sub-App */}
              <Route path="/rentalos/*" element={
                <Suspense fallback={<LoadingState type="rentalos" />}>
                  <RentalOSLayout />
                </Suspense>
              } />

              {/* Public Sub-App */}
              <Route element={
                <Suspense fallback={<LoadingState />}>
                  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <MainLayout />
                  </GoogleOAuthProvider>
                </Suspense>
              }>
                <Route path="/" element={<Index />} />
                <Route path="/search-vehicles" element={<SearchVehicles />} />
                <Route path="/business-rental-network" element={<BusinessRentalNetwork />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/search/:seoSlug" element={<DynamicLanding />} />
                <Route path="/rent/:vehicleType/in/:city" element={<DynamicLanding />} />
                <Route path="/rent/:vehicleType" element={<DynamicLanding />} />
                
                {/* Legal and Content Pages */}
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/blog-travel-guides" element={<BlogTravelGuides />} />
                <Route path="/cancellation-and-refund-policy" element={<CancellationPolicy />} />
                <Route path="/faq-help-center" element={<FaqHelpCenter />} />
                <Route path="/partner-with-us" element={<PartnerWithUs />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/rental-partner-terms" element={<RentalPartnerTerms />} />
                <Route path="/rentalos-data-handling" element={<RentalosDataHandling />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/trust-and-safety" element={<TrustAndSafety />} />

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
    </AuthProvider>
  );
}

export default App;
