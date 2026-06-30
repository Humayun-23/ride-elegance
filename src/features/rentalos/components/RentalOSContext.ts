import { createContext, useContext } from 'react';
import type { CatalogVehicle, RentalBooking, RentalOSAccessShop, RentalOSMe } from '../types';

export type ManageBookingFocus = 'payment' | 'completion' | null;

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
  manageBookingFocus: ManageBookingFocus;
  setManageBookingFocus: (focus: ManageBookingFocus) => void;
  refreshKey: number;
  refreshBookings: () => void;
  catalogueOpen: boolean;
  openCatalogue: () => void;
  closeCatalogue: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  openCommand: () => void;
  createBookingOpen: boolean;
  setCreateBookingOpen: (open: boolean) => void;
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
  manageBookingFocus: null,
  setManageBookingFocus: () => undefined,
  refreshKey: 0,
  refreshBookings: () => undefined,
  catalogueOpen: false,
  openCatalogue: () => undefined,
  closeCatalogue: () => undefined,
  sidebarCollapsed: false,
  toggleSidebar: () => undefined,
  openCommand: () => undefined,
  createBookingOpen: false,
  setCreateBookingOpen: () => undefined,
});

export const useRentalOS = () => useContext(RentalOSContext);
