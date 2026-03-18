import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "./use-api";
import { BreakPlan, BreakAssignment, ProposeBreakPlanResponse } from "@/types/schema";

export function useBreakPlans(locationId: string | null) {
  return useQuery({
    queryKey: ["/api/break-plans", locationId],
    queryFn: () => fetchApi<BreakPlan[]>(`/api/break-plans?locationId=${locationId}`),
    enabled: !!locationId,
  });
}

export function useBreakAssignments(planId: string | null) {
  return useQuery({
    queryKey: ["/api/break-plans", planId, "assignments"],
    queryFn: () => fetchApi<BreakAssignment[]>(`/api/break-plans/${planId}/assignments`),
    enabled: !!planId,
  });
}

export function useProposeBreakPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { locationId: string; planDate?: string; snapshotId?: string }) => 
      fetchApi<ProposeBreakPlanResponse>("/api/break-plans/propose", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/break-plans", variables.locationId] });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<BreakAssignment>) =>
      fetchApi(`/api/break-plans/assignments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate all assignments queries to refresh the board
      queryClient.invalidateQueries({ queryKey: ["/api/break-plans"] });
    },
  });
}
