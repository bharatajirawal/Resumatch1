import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useResumes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const response = await apiClient.get("/resumes/");
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/resumes/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    },
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/resumes/${id}/reanalyze/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  return {
    ...query,
    deleteResume: deleteMutation.mutateAsync,
    reanalyzeResume: reanalyzeMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    isReanalyzing: reanalyzeMutation.isPending,
  };
}
