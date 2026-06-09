import api from "@/lib/api";

export const getShops = (params?: Record<string, any>) => {
  return api.get("/shops/", { params });
};

export const getShop = (id: string | number) => {
  return api.get(`/shops/${id}`);
};

export const getShopReviews = (shopId: string | number) => {
  return api.get(`/reviews/${shopId}`);
};
