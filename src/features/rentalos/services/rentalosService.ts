import api from '@/lib/api';
import type {
  CatalogVehicle,
  RentalBooking,
  RentalBookingNote,
  RentalCustomer,
  RentalCustomerFlag,
  RentalCustomerSearch,
  RentalDocument,
  RentalHandoverPhoto,
  RentalOSMe,
  RentalPayment,
  RentalStaff,
  ShopBike,
} from '../types';

export const getMe = () => {
  return api.get<RentalOSMe>('/rentalos/me');
};

export const getCatalogVehicles = (shopId: number | string, startTime?: string, endTime?: string) => {
  const params: Record<string, number | string> = { shop_id: shopId };
  if (startTime) params.start_time = startTime;
  if (endTime) params.end_time = endTime;
  return api.get<CatalogVehicle[]>('/rentalos/catalog/vehicles', { params });
};

// Full shop catalogue (all bikes regardless of availability window).
export const getShopBikes = (shopId: number | string) => {
  return api.get<ShopBike[]>(`/bikes/shop/${shopId}`);
};

export const searchCustomer = (shopId: number | string, phone: string) => {
  return api.get<RentalCustomerSearch>('/rentalos/customers/search', { params: { shop_id: shopId, phone } });
};

export const createCustomer = (payload: any) => {
  return api.post<RentalCustomer>('/rentalos/customers', payload);
};

export const getBookings = (shopId: number | string, filters?: { status?: string; start_date?: string; end_date?: string }) => {
  return api.get<RentalBooking[]>('/rentalos/bookings', { params: { shop_id: shopId, ...filters } });
};

export const getBooking = (bookingId: number | string) => {
  return api.get<RentalBooking>(`/rentalos/bookings/${bookingId}`);
};

export const createBooking = (payload: any) => {
  return api.post<RentalBooking>('/rentalos/bookings', payload);
};

export const cancelBooking = (bookingId: number | string) => {
  return api.post<RentalBooking>(`/rentalos/bookings/${bookingId}/cancel`);
};

export const getBookingDocuments = (bookingId: number | string) => {
  return api.get<RentalDocument[]>(`/rentalos/bookings/${bookingId}/documents`);
};

export const uploadBookingDocument = (bookingId: number | string, formData: FormData) => {
  return api.post<RentalDocument>(`/rentalos/bookings/${bookingId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getHandoverPhotos = (bookingId: number | string) => {
  return api.get<RentalHandoverPhoto[]>(`/rentalos/bookings/${bookingId}/handover-photos`);
};

export const uploadHandoverPhoto = (bookingId: number | string, formData: FormData) => {
  return api.post<RentalHandoverPhoto>(`/rentalos/bookings/${bookingId}/handover-photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getPayments = (bookingId: number | string) => {
  return api.get<RentalPayment[]>(`/rentalos/bookings/${bookingId}/payments`);
};

export const recordPayment = (bookingId: number | string, payload: any) => {
  return api.post<RentalPayment>(`/rentalos/bookings/${bookingId}/payments`, payload);
};

export const completeBooking = (bookingId: number | string, payload: any) => {
  return api.post<RentalBooking>(`/rentalos/bookings/${bookingId}/complete`, payload);
};

export const getBookingNotes = (bookingId: number | string) => {
  return api.get<RentalBookingNote[]>(`/rentalos/bookings/${bookingId}/notes`);
};

export const addBookingNote = (bookingId: number | string, note: string) => {
  return api.post<RentalBookingNote>(`/rentalos/bookings/${bookingId}/notes`, { note });
};

export const getCustomerFlags = (customerId: number | string) => {
  return api.get<RentalCustomerFlag[]>(`/rentalos/customers/${customerId}/flags`);
};

export const addCustomerFlag = (customerId: number | string, payload: any) => {
  return api.post<RentalCustomerFlag>(`/rentalos/customers/${customerId}/flags`, payload);
};

export const getStaff = (shopId: number | string) => {
  return api.get<RentalStaff[]>('/rentalos/staff', { params: { shop_id: shopId } });
};

export const createStaff = (payload: any) => {
  return api.post<RentalStaff>('/rentalos/staff', payload);
};

export const updateStaff = (staffId: number | string, payload: any) => {
  return api.patch<RentalStaff>(`/rentalos/staff/${staffId}`, payload);
};
