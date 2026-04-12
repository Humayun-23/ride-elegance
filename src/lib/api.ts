const API_BASE = "http://localhost:8000/api/v1";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || err.message || `Error ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

// Auth
export const api = {
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string }>("/login", { method: "POST", body: JSON.stringify(data) }),
  adminLogin: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string }>("/admin/login", { method: "POST", body: JSON.stringify(data) }),
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    request<any>("/users/", { method: "POST", body: JSON.stringify(data) }),
  passwordResetRequest: (data: { email: string }) =>
    request<any>("/password-reset/request", { method: "POST", body: JSON.stringify(data) }),
  passwordResetConfirm: (data: { token: string; new_password: string }) =>
    request<any>("/password-reset/confirm", { method: "POST", body: JSON.stringify(data) }),

  // Users
  getUser: (id: string) => request<any>(`/users/${id}`),
  updateUser: (id: string, data: any) => request<any>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Shops
  getShops: () => request<any[]>("/shops/"),
  createShop: (data: any) => request<any>("/shops/", { method: "POST", body: JSON.stringify(data) }),
  getShop: (id: string) => request<any>(`/shops/${id}`),
  updateShop: (id: string, data: any) => request<any>(`/shops/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteShop: (id: string) => request<any>(`/shops/${id}`, { method: "DELETE" }),

  // Bookings
  createBooking: (data: any) => request<any>("/bookings/", { method: "POST", body: JSON.stringify(data) }),
  getUserBookings: () => request<any[]>("/bookings/user/"),
  getBooking: (id: string) => request<any>(`/bookings/${id}`),
  updateBooking: (id: string, data: any) => request<any>(`/bookings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBooking: (id: string) => request<any>(`/bookings/${id}`, { method: "DELETE" }),
  confirmBooking: (id: string) => request<any>(`/bookings/${id}/confirm`, { method: "POST" }),
  rejectBooking: (id: string) => request<any>(`/bookings/${id}/reject`, { method: "POST" }),
  completeBooking: (id: string) => request<any>(`/bookings/${id}/complete`, { method: "POST" }),

  // Bikes/Vehicles
  createBike: (data: any) => request<any>("/bikes/", { method: "POST", body: JSON.stringify(data) }),
  getBike: (id: string) => request<any>(`/bikes/${id}`),
  updateBike: (id: string, data: any) => request<any>(`/bikes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBike: (id: string) => request<any>(`/bikes/${id}`, { method: "DELETE" }),
  getBikesByShop: (shopId: string) => request<any[]>(`/bikes/shop/${shopId}`),

  // Inventory
  createInventory: (data: any) => request<any>("/inventory/", { method: "POST", body: JSON.stringify(data) }),
  getInventoryByBike: (bikeId: string) => request<any>(`/inventory/bike/${bikeId}`),
  getInventoryByShop: (shopId: string) => request<any[]>(`/inventory/shop/${shopId}`),
  getAvailableInventory: (bikeId: string) => request<any>(`/inventory/available/${bikeId}`),
  updateInventory: (bikeId: string, data: any) => request<any>(`/inventory/${bikeId}`, { method: "PUT", body: JSON.stringify(data) }),
  getAvailabilityTimerange: (params: { start: string; end: string; bike_id?: string }) =>
    request<any>(`/inventory/availability/timerange?${new URLSearchParams(params as any)}`),

  // Search
  searchVehicles: (params?: Record<string, string>) =>
    request<any[]>(`/search/vehicles${params ? "?" + new URLSearchParams(params) : ""}`),
  searchVehiclesByType: (type: string) => request<any[]>(`/search/vehicles/type/${type}`),

  // Reviews
  getShopReviews: (shopId: string) => request<any[]>(`/shops/${shopId}/reviews`),
  createReview: (shopId: string, data: any) => request<any>(`/shops/${shopId}/reviews`, { method: "POST", body: JSON.stringify(data) }),
  updateReview: (shopId: string, reviewId: string, data: any) =>
    request<any>(`/shops/${shopId}/reviews/${reviewId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteReview: (shopId: string, reviewId: string) =>
    request<any>(`/shops/${shopId}/reviews/${reviewId}`, { method: "DELETE" }),
};
