import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useMatches() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const response = await apiClient.get("/matches/");
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const findMatchesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/matches/find_matches/");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async ({ jobId, resumeId }: { jobId: string; resumeId?: string }) => {
      const response = await apiClient.post(`/jobs/${jobId}/apply/`, {
        resume_id: resumeId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    },
  });

  const compareMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiClient.get(`/matches/compare_resumes/?job_id=${jobId}`);
      return response.data;
    },
  });

  return {
    ...query,
    findMatches: findMatchesMutation.mutateAsync,
    isFindingMatches: findMatchesMutation.isPending,
    apply: applyMutation.mutateAsync,
    isApplying: applyMutation.isPending,
    compare: compareMutation.mutateAsync,
    isComparing: compareMutation.isPending,
  };
}
