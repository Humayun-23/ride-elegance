import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useSearchVehicles = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['searchVehicles', params],
    queryFn: async () => {
      const response = await api.get('/search/vehicles', { params });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};