import { useQuery } from "@tanstack/react-query";
import { getPlatformStatsSummary, PlatformStats } from "../services/statisticsService";

export const usePlatformStats = () => {
  return useQuery<PlatformStats, Error>({
    queryKey: ["platform-stats-summary"],
    queryFn: getPlatformStatsSummary,
    // 1 hour stale time on frontend to avoid refetching too often during session
    staleTime: 60 * 60 * 1000, 
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
