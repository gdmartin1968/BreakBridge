import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "./use-api";
import { AdminStatus, RuleConfig } from "@/types/schema";

export function useAdminStatus() {
  return useQuery({
    queryKey: ["/api/admin/status"],
    queryFn: () => fetchApi<AdminStatus>("/api/admin/status"),
  });
}

export function useRuleConfig(locationId: string | null) {
  return useQuery({
    queryKey: ["/api/rule-engine/config", locationId],
    queryFn: () => fetchApi<RuleConfig>(`/api/rule-engine/config?locationId=${locationId}`),
    enabled: !!locationId,
  });
}

export function useUpdateRuleConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RuleConfig & { locationId: string }) =>
      fetchApi("/api/rule-engine/config", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rule-engine/config", variables.locationId] });
    },
  });
}
