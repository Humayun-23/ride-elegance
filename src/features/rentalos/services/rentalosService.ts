import api from '@/lib/api';
import type {
  CatalogVehicle,
  RentalBooking,
  RentalBookingCounts,
  RentalBookingCompletePayload,
  RentalBookingNote,
  RentalCustomer,
  RentalCustomerFlag,
  RentalCustomerSearch,
  RentalDashboardDetails,
  RentalDashboardSummary,
  RentalDocument,
  RentalHandoverPhoto,
  RentalOSMe,
  RentalPayment,
  RentalPaymentCreatePayload,
  RentalStaff,
} from '../types';

export type RentalBookingsResponse = {
  items: RentalBooking[];
  total: number;
  counts?: RentalBookingCounts;
};

export type RentalBookingFilters = {
  status?: string;
  tab?: 'all' | 'active' | 'due_today' | 'overdue' | 'completed';
  customer_id?: number;
  start_date?: string;
  end_date?: string;
  dashboard?: boolean;
  sort_by?: 'end_time' | 'customer' | 'vehicle' | 'balance_due';
  sort_dir?: 'asc' | 'desc';
  timezone_offset_minutes?: number;
};

export const getMe = () => {
  return api.get<RentalOSMe>('/rentalos/me');
};

export const getCatalogVehicles = (shopId: number | string, startTime?: string, endTime?: string) => {
  const params: Record<string, number | string> = { shop_id: shopId };
  if (startTime) params.start_time = startTime;
  if (endTime) params.end_time = endTime;
  return api.get<CatalogVehicle[]>('/rentalos/catalog/vehicles', { params });
};

export const createVehicle = (payload: Record<string, unknown>) => {
  return api.post('/bikes/', payload);
};

export const updateVehicle = (bikeId: number | string, payload: Record<string, unknown>) => {
  return api.put(`/bikes/${bikeId}`, payload);
};

export const uploadVehicleImages = (bikeId: number | string, formData: FormData) => {
  return api.post(`/bikes/${bikeId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const searchCustomer = (shopId: number | string, phone: string) => {
  return api.get<RentalCustomerSearch>('/rentalos/customers/search', { params: { shop_id: shopId, phone } });
};

export const getCustomers = (shopId: number | string) => {
  return api.get<RentalCustomer[]>('/rentalos/customers', { params: { shop_id: shopId } });
};

export const createCustomer = (payload: Record<string, unknown>) => {
  return api.post<RentalCustomer>('/rentalos/customers', payload);
};

export const getBookings = (
  shopId: number | string,
  filters?: RentalBookingFilters,
  pagination?: { skip?: number; limit?: number }
) => {
  return api.get<RentalBookingsResponse>('/rentalos/bookings', {
    params: { shop_id: shopId, ...filters, ...pagination }
  });
};

export const getDashboardSummary = (shopId: number | string) => {
  return api.get<RentalDashboardSummary>('/rentalos/dashboard/summary', {
    params: {
      shop_id: shopId,
      timezone_offset_minutes: new Date().getTimezoneOffset(),
    },
  });
};

export const getDashboardDetails = (shopId: number | string) => {
  return api.get<RentalDashboardDetails>('/rentalos/dashboard/details', {
    params: {
      shop_id: shopId,
      timezone_offset_minutes: new Date().getTimezoneOffset(),
    },
  });
};

export const getBooking = (bookingId: number | string) => {
  return api.get<RentalBooking>(`/rentalos/bookings/${bookingId}`);
};

export const createBooking = (payload: Record<string, unknown>) => {
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

export const recordPayment = (bookingId: number | string, payload: RentalPaymentCreatePayload) => {
  return api.post<RentalPayment>(`/rentalos/bookings/${bookingId}/payments`, payload);
};

export const completeBooking = (bookingId: number | string, payload: RentalBookingCompletePayload) => {
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

export const addCustomerFlag = (customerId: number | string, payload: Record<string, unknown>) => {
  return api.post<RentalCustomerFlag>(`/rentalos/customers/${customerId}/flags`, payload);
};

export const getStaff = (shopId: number | string) => {
  return api.get<RentalStaff[]>('/rentalos/staff', { params: { shop_id: shopId } });
};

export const createStaff = (payload: Record<string, unknown>) => {
  return api.post<RentalStaff>('/rentalos/staff', payload);
};

export const updateStaff = (staffId: number | string, payload: Record<string, unknown>) => {
  return api.patch<RentalStaff>(`/rentalos/staff/${staffId}`, payload);
};
