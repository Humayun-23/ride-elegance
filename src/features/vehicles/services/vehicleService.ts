import api from "@/lib/api";
import type { AxiosRequestConfig } from "axios";

export const searchVehicles = (params?: Record<string, any>) => {
  return api.get("/search/vehicles", { params });
};

export const getBikes = () => {
  return api.get("/bikes/");
};

export const getVehicleFullDetails = (id: string | number, config?: AxiosRequestConfig) => {
  return api.get(`/bikes/${id}/full-details`, config);
};
