import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useShops = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['shops', params],
    queryFn: async () => {
      const response = await api.get('/shops/', { params });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};