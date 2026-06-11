import api from "@/lib/api";

export interface PlatformStats {
  total_shops: number;
  total_vehicles: number;
  total_bookings: number;
}

export const getPlatformStatsSummary = async (): Promise<PlatformStats> => {
  const response = await api.get<PlatformStats>("/statistics/summary");
  return response.data;
};
