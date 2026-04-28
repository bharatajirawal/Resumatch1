import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const response = await apiClient.get("/users/dashboard/");
      return response.data;
    },
    // Keep data fresh for 1 minute, but stale data will be shown while fetching
    staleTime: 1000 * 60, 
  });
}
