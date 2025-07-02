import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface DashboardStats {
  total_documents: number;
  shared_documents: number;
  total_views: number;
  collaborators: number;
  recent_activity: any[];
}

export function useStats() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      return apiClient.get("/stats/dashboard/");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    stats,
    isLoading,
    error,
  };
}

