import { useQuery } from '@tanstack/react-query';
import { getShops } from '@/features/shops/services/shopService';

export const useShops = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['shops', params],
    queryFn: async () => {
      const response = await getShops(params);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
