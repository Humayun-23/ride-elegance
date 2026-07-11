import { useCallback } from 'react';
import { keepPreviousData, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  getBookings,
  getCatalogVehicles,
  getCustomers,
  getDashboardDetails,
  getDashboardSummary,
  getMe,
  getStaff,
  getBooking,
  getBookingDocuments,
  getHandoverPhotos,
  getPayments,
  getBookingNotes,
} from '../services/rentalosService';
import type { RentalBookingFilters, RentalBookingsResponse } from '../services/rentalosService';

export type BookingFilters = {
} & RentalBookingFilters;

const SHORT_STALE_TIME = 30 * 1000;
const CATALOG_STALE_TIME = 60 * 1000;
const DIRECTORY_STALE_TIME = 2 * 60 * 1000;

export function normalizeBookingsResponse(data: RentalBookingsResponse): RentalBookingsResponse {
  const legacyData = data as RentalBookingsResponse | unknown[];
  if (Array.isArray(legacyData)) {
    return { items: legacyData as RentalBookingsResponse['items'], total: legacyData.length };
  }
  return {
    items: Array.isArray(data.items) ? data.items : [],
    total: typeof data.total === 'number' ? data.total : Array.isArray(data.items) ? data.items.length : 0,
    counts: data.counts,
  };
}

export function rentalOSErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    return response?.data?.detail || fallback;
  }
  return fallback;
}

export const rentalOSKeys = {
  all: ['rentalos'] as const,
  access: () => [...rentalOSKeys.all, 'access'] as const,
  shop: (shopId: number | string | null | undefined) => [...rentalOSKeys.all, 'shop', shopId] as const,
  bookings: (shopId: number | string | null | undefined, filters?: BookingFilters) =>
    filters === undefined ? [...rentalOSKeys.shop(shopId), 'bookings'] as const : [...rentalOSKeys.shop(shopId), 'bookings', filters] as const,
  dashboardSummary: (shopId: number | string | null | undefined) => [...rentalOSKeys.shop(shopId), 'dashboard-summary'] as const,
  dashboardDetails: (shopId: number | string | null | undefined) => [...rentalOSKeys.shop(shopId), 'dashboard-details'] as const,
  booking: (bookingId: number | string | null | undefined) => [...rentalOSKeys.all, 'booking', bookingId] as const,
  bookingDocuments: (bookingId: number | string | null | undefined) => [...rentalOSKeys.booking(bookingId), 'documents'] as const,
  bookingHandoverPhotos: (bookingId: number | string | null | undefined) => [...rentalOSKeys.booking(bookingId), 'handover-photos'] as const,
  bookingPayments: (bookingId: number | string | null | undefined) => [...rentalOSKeys.booking(bookingId), 'payments'] as const,
  bookingNotes: (bookingId: number | string | null | undefined) => [...rentalOSKeys.booking(bookingId), 'notes'] as const,
  customerFlags: (customerId: number | string | null | undefined) => [...rentalOSKeys.all, 'customer', customerId, 'flags'] as const,
  catalog: (shopId: number | string | null | undefined, startTime?: string, endTime?: string) =>
    [...rentalOSKeys.shop(shopId), 'catalog', startTime || '', endTime || ''] as const,
  customers: (shopId: number | string | null | undefined) => [...rentalOSKeys.shop(shopId), 'customers'] as const,
  staff: (shopId: number | string | null | undefined) => [...rentalOSKeys.shop(shopId), 'staff'] as const,
};

export function useRentalOSAccess() {
  return useQuery({
    queryKey: rentalOSKeys.access(),
    queryFn: async () => (await getMe()).data,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useRentalOSBookings(
  shopId: number | string | null | undefined,
  filters?: BookingFilters,
  options?: { enabled?: boolean; refetchInterval?: number; limit?: number },
) {
  const limit = options?.limit ?? 20;
  return useInfiniteQuery({
    queryKey: [...rentalOSKeys.bookings(shopId, filters), { limit }] as const,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await getBookings(shopId as number | string, filters, { skip: pageParam, limit });
      const page = normalizeBookingsResponse(res.data);
      const nextCursor = pageParam + page.items.length < page.total ? pageParam + limit : undefined;
      return { ...page, nextCursor };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    enabled: Boolean(shopId) && (options?.enabled ?? true),
    staleTime: SHORT_STALE_TIME,
    refetchInterval: options?.refetchInterval,
    refetchOnWindowFocus: false,
  });
}

export function useRentalOSDashboardSummary(
  shopId: number | string | null | undefined,
  options?: { enabled?: boolean; refetchInterval?: number },
) {
  return useQuery({
    queryKey: rentalOSKeys.dashboardSummary(shopId),
    queryFn: async () => (await getDashboardSummary(shopId as number | string)).data,
    enabled: Boolean(shopId) && (options?.enabled ?? true),
    staleTime: SHORT_STALE_TIME,
    refetchInterval: options?.refetchInterval,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useRentalOSDashboardDetails(
  shopId: number | string | null | undefined,
  options?: { enabled?: boolean; refetchInterval?: number },
) {
  return useQuery({
    queryKey: rentalOSKeys.dashboardDetails(shopId),
    queryFn: async () => (await getDashboardDetails(shopId as number | string)).data,
    enabled: Boolean(shopId) && (options?.enabled ?? true),
    staleTime: SHORT_STALE_TIME,
    refetchInterval: options?.refetchInterval,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useRentalOSCatalog(
  shopId: number | string | null | undefined,
  startTime?: string,
  endTime?: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: rentalOSKeys.catalog(shopId, startTime, endTime),
    queryFn: async () => (await getCatalogVehicles(shopId as number | string, startTime, endTime)).data,
    enabled: Boolean(shopId) && (options?.enabled ?? true),
    staleTime: CATALOG_STALE_TIME,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useRentalOSCustomers(shopId: number | string | null | undefined) {
  return useQuery({
    queryKey: rentalOSKeys.customers(shopId),
    queryFn: async () => (await getCustomers(shopId as number | string)).data,
    enabled: Boolean(shopId),
    staleTime: DIRECTORY_STALE_TIME,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useRentalOSStaff(shopId: number | string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: rentalOSKeys.staff(shopId),
    queryFn: async () => (await getStaff(shopId as number | string)).data,
    enabled: Boolean(shopId) && enabled,
    staleTime: DIRECTORY_STALE_TIME,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

export function useRentalOSBookingDetail(bookingId: number | string | null | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: rentalOSKeys.booking(bookingId),
    queryFn: async () => (await getBooking(bookingId as number | string)).data,
    enabled: Boolean(bookingId) && (options?.enabled ?? true),
    staleTime: SHORT_STALE_TIME,
  });
}

export function useRentalOSBookingDocuments(bookingId: number | string | null | undefined) {
  return useQuery({
    queryKey: rentalOSKeys.bookingDocuments(bookingId),
    queryFn: async () => (await getBookingDocuments(bookingId as number | string)).data,
    enabled: Boolean(bookingId),
    staleTime: SHORT_STALE_TIME,
  });
}

export function useRentalOSBookingPhotos(bookingId: number | string | null | undefined) {
  return useQuery({
    queryKey: rentalOSKeys.bookingHandoverPhotos(bookingId),
    queryFn: async () => (await getHandoverPhotos(bookingId as number | string)).data,
    enabled: Boolean(bookingId),
    staleTime: SHORT_STALE_TIME,
  });
}

export function useRentalOSBookingPayments(bookingId: number | string | null | undefined) {
  return useQuery({
    queryKey: rentalOSKeys.bookingPayments(bookingId),
    queryFn: async () => (await getPayments(bookingId as number | string)).data,
    enabled: Boolean(bookingId),
    staleTime: SHORT_STALE_TIME,
  });
}

export function useRentalOSBookingNotes(bookingId: number | string | null | undefined) {
  return useQuery({
    queryKey: rentalOSKeys.bookingNotes(bookingId),
    queryFn: async () => (await getBookingNotes(bookingId as number | string)).data,
    enabled: Boolean(bookingId),
    staleTime: SHORT_STALE_TIME,
  });
}

export function useInvalidateRentalOS() {
  const queryClient = useQueryClient();

  return useCallback((shopId?: number | string | null) => {
    if (shopId) {
      void queryClient.invalidateQueries({ queryKey: rentalOSKeys.shop(shopId) });
    }
    void queryClient.invalidateQueries({ queryKey: rentalOSKeys.access() });
  }, [queryClient]);
}
