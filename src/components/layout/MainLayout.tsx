import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';
import { LoadingState } from '../common/LoadingState';

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingState />}>
        <Outlet />
      </Suspense>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
