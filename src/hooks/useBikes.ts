import { useQuery } from '@tanstack/react-query';
import api from '../lib/api'; // <-- Import the centralized API client

const fetchBikes = async () => {
  // Use the pre-configured api client. It handles the base URL,
  // authentication, and basic error handling.
  const response = await api.get('/bikes/');
  // Axios automatically parses the JSON, so we just return response.data
  return response.data;
};

export const useBikes = () => {
  return useQuery({
    queryKey: ['bikes'],
    queryFn: fetchBikes,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes before refetching
    retry: 1,
  });
};