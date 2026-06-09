import api from "@/lib/api";

export const getUserBookings = (params?: Record<string, any>) => {
  return api.get("/bookings/user/", { params });
};

export const getBooking = (id: string | number) => {
  return api.get(`/bookings/${id}`);
};

export const createBooking = (payload: {
  bike_id: number;
  start_time: string;
  end_time: string;
  utr_number: string;
}) => {
  return api.post("/bookings/", payload);
};

export const updateBooking = (
  id: string | number,
  payload: {
    start_time: string;
    end_time: string;
  },
) => {
  return api.put(`/bookings/${id}`, payload);
};

export const cancelBookingById = (id: string | number) => {
  return api.delete(`/bookings/${id}`);
};

export const getBookingBike = (bikeId: string | number) => {
  return api.get(`/bikes/${bikeId}`);
};

export const getPaymentByBooking = (bookingId: string | number) => {
  return api.get(`/payments/booking/${bookingId}`);
};

export const requestBookingRefund = (payload: {
  order_id: string;
  reason: string;
}) => {
  return api.post("/payments/refund", payload);
};

export const submitBookingReview = (
  shopId: string | number,
  payload: {
    rating: number;
    comment: string;
  },
) => {
  return api.post(`/reviews/${shopId}`, payload);
};
