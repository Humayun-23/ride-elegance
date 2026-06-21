import api from "@/lib/api";

export const getAdminShops = (isAdmin: boolean) => {
  return api.get(isAdmin ? "/shops/" : "/shops/me");
};

export const getAllShops = () => {
  return api.get("/shops/");
};

export const getShopDashboardMetrics = () => {
  return api.get("/shops/dashboard-metrics");
};

export const getAdminAnalytics = () => {
  return api.get("/shops/analytics");
};

export const createAdminShop = (payload: any) => {
  return api.post("/shops/", payload);
};

export const updateAdminShop = (id: string | number, payload: any) => {
  return api.put(`/shops/${id}`, payload);
};

export const deleteAdminShop = (id: string | number) => {
  return api.delete(`/shops/${id}`);
};

export const uploadAdminShopImage = (id: string | number, formData: FormData, config?: any) => {
  return api.post(`/shops/${id}/image`, formData, config);
};

// Reviews
export const getAdminShopReviews = (shopId: string | number) => {
  return api.get(`/reviews/${shopId}`);
};

// Inventory (Bikes)
export const getAdminShopBikes = (shopId: string | number) => {
  return api.get(`/bikes/shop/${shopId}`);
};

export const createAdminBike = (payload: any) => {
  return api.post("/bikes/", payload);
};

export const updateAdminBike = (id: string | number, payload: any) => {
  return api.put(`/bikes/${id}`, payload);
};

export const deleteAdminBike = (id: string | number) => {
  return api.delete(`/bikes/${id}`);
};

export const uploadAdminBikeImages = (id: string | number, formData: FormData, config?: any) => {
  return api.post(`/bikes/${id}/images`, formData, config);
};

// Service Logs
export const getServiceLogs = (bikeId: string | number) => {
  return api.get(`/bikes/${bikeId}/service-logs`);
};

export const createServiceLog = (bikeId: string | number, payload: any) => {
  return api.post(`/bikes/${bikeId}/service-logs`, payload);
};

export const deleteServiceLog = (bikeId: string | number, logId: string | number) => {
  return api.delete(`/bikes/${bikeId}/service-logs/${logId}`);
};

// Bookings
export const getAdminBookings = (params?: any) => {
  return api.get("/bookings/", { params });
};

export const getAdminBookingById = (id: string | number) => {
  return api.get(`/bookings/${id}`);
};

export const actionAdminBooking = (id: string | number, action: string) => {
  return api.post(`/bookings/${id}/${action}`);
};
