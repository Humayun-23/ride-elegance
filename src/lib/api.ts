const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://api.gopanda.in/api/v1";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData && !("Content-Type" in headers)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      const here = window.location.pathname;
      const isAuthRoute = /^\/(login|register|admin\/login|forgot-password|password-reset)/.test(here);
      if (!isAuthRoute) window.location.href = "/login";
    }
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || err.message || `Error ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

export const api = {
  // Auth
  login: (data: { username: string; password: string }) =>
    request<{ access_token: string; token_type: string }>("/login", {
      method: "POST",
      body: new URLSearchParams(data).toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  adminLogin: (data: { username: string; password: string }) =>
    request<{ access_token: string; token_type: string }>("/admin/login", {
      method: "POST",
      body: new URLSearchParams(data).toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  register: (data: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    phone_number: string;
    user_type: "customer" | "shop_owner";
  }) => request<any>("/users/", { method: "POST", body: JSON.stringify(data) }),
  passwordResetRequest: (data: { email: string }) =>
    request<{ message: string }>("/password-reset/request", { method: "POST", body: JSON.stringify(data) }),
  passwordResetConfirm: (data: { token: string; new_password: string }) =>
    request<{ message: string }>("/password-reset/confirm", { method: "POST", body: JSON.stringify(data) }),

  // Users
  getUser: (id: string) => request<any>(`/users/${id}`),
  updateUser: (id: string, data: { firstname?: string; lastname?: string; phone_number?: string }) =>
    request<any>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // Shops
  getShops: (params?: { skip?: number; limit?: number }) =>
    request<any[]>(`/shops/${params ? "?" + new URLSearchParams(params as any) : ""}`),
  createShop: (data: {
    name: string;
    phone_number: string;
    address: string;
    city: string;
    description?: string;
    state?: string;
    zip_code?: string;
    opening_time?: string;
    closing_time?: string;
    is_active?: boolean;
  }) => request<any>("/shops/", { method: "POST", body: JSON.stringify(data) }),
  getShop: (id: string) => request<any>(`/shops/${id}`),
  updateShop: (id: string, data: any) => request<any>(`/shops/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteShop: (id: string) => request<any>(`/shops/${id}`, { method: "DELETE" }),
  uploadShopImage: (shopId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<any>(`/shops/${shopId}/image`, { method: "POST", body: form });
  },

  // Bookings
  createBooking: (data: { bike_id: number; start_time: string; end_time: string }) =>
    request<any>("/bookings/", { method: "POST", body: JSON.stringify(data) }),
  getUserBookings: (params?: { skip?: number; limit?: number }) =>
    request<any[]>(`/bookings/user/${params ? "?" + new URLSearchParams(params as any) : ""}`),
  getBooking: (id: string) => request<any>(`/bookings/${id}`),
  updateBooking: (id: string, data: { start_time?: string; end_time?: string }) =>
    request<any>(`/bookings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBooking: (id: string) => request<any>(`/bookings/${id}`, { method: "DELETE" }),
  confirmBooking: (id: string) => request<any>(`/bookings/${id}/confirm`, { method: "POST" }),
  rejectBooking: (id: string) => request<any>(`/bookings/${id}/reject`, { method: "POST" }),
  completeBooking: (id: string) => request<any>(`/bookings/${id}/complete`, { method: "POST" }),
  returnBooking: (id: string) => request<any>(`/bookings/${id}/return`, { method: "POST" }),

  // Bikes/Vehicles
  createBike: (data: {
    shop_id: number;
    name: string;
    model: string;
    bike_type: string;
    engine_cc?: number;
    description?: string;
    price_per_hour: number;
    price_per_day: number;
    condition?: "excellent" | "good" | "fair";
    is_available?: boolean;
  }) => request<any>("/bikes/", { method: "POST", body: JSON.stringify(data) }),
  getBike: (id: string) => request<any>(`/bikes/${id}`),
  updateBike: (id: string, data: {
    name?: string;
    model?: string;
    bike_type?: string;
    engine_cc?: number;
    description?: string;
    price_per_hour?: number;
    price_per_day?: number;
    condition?: "excellent" | "good" | "fair";
    is_available?: boolean;
  }) => request<any>(`/bikes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBike: (id: string) => request<any>(`/bikes/${id}`, { method: "DELETE" }),
  getBikesByShop: (shopId: string, params?: { skip?: number; limit?: number }) =>
    request<any[]>(`/bikes/shop/${shopId}${params ? "?" + new URLSearchParams(params as any) : ""}`),
  uploadBikeImages: (bikeId: string, files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    return request<any>(`/bikes/${bikeId}/images`, { method: "POST", body: form });
  },

  // Inventory
  createInventory: (data: { bike_id: number; shop_id: number; total_quantity: number }) =>
    request<any>("/inventory/", { method: "POST", body: JSON.stringify(data) }),
  getInventoryByBike: (bikeId: string) => request<any>(`/inventory/bike/${bikeId}`),
  getInventoryByShop: (shopId: string, params?: { skip?: number; limit?: number }) =>
    request<any[]>(`/inventory/shop/${shopId}${params ? "?" + new URLSearchParams(params as any) : ""}`),
  getAvailableInventory: (bikeId: string) => request<any>(`/inventory/available/${bikeId}`),
  updateInventory: (bikeId: string, data: { total_quantity: number }) =>
    request<any>(`/inventory/${bikeId}`, { method: "PUT", body: JSON.stringify(data) }),
  getAvailabilityTimerange: (params: { shop_id: string; start_time: string; end_time: string }) =>
    request<any>(`/inventory/availability/timerange?${new URLSearchParams(params)}`),

  // Search
  searchVehicles: (params?: Record<string, string>) =>
    request<any[]>(`/search/vehicles${params ? "?" + new URLSearchParams(params) : ""}`),
  searchVehiclesByType: (type: string, params?: Record<string, string>) =>
    request<any[]>(`/search/vehicles/type/${type}${params ? "?" + new URLSearchParams(params) : ""}`),

  // Reviews (per-bike, tied to a completed booking)
  createReview: (data: { booking_id: number; rating: number; comment?: string }) =>
    request<any>(`/reviews/`, { method: "POST", body: JSON.stringify(data) }),
  getBikeReviews: (bikeId: string) => request<any[]>(`/reviews/${bikeId}`),
  listReviews: (params?: { skip?: number; limit?: number }) =>
    request<any[]>(`/reviews/${params ? "?" + new URLSearchParams(params as any) : ""}`),

  // Bookings (admin/list)
  listBookings: (params?: { skip?: number; limit?: number }) =>
    request<any[]>(`/bookings/${params ? "?" + new URLSearchParams(params as any) : ""}`),
};
