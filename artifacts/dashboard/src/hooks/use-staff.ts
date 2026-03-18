import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./use-api";
import { Staff } from "@/types/schema";

export function useStaff(locationId: string | null) {
  return useQuery({
    queryKey: ["/api/staff", locationId],
    queryFn: () => fetchApi<Staff[]>(`/api/staff?locationId=${locationId}`),
    enabled: !!locationId,
    refetchInterval: 30000,
  });
}
