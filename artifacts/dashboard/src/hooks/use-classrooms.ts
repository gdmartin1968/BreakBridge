import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./use-api";
import { Classroom } from "@/types/schema";

export function useClassrooms(locationId: string | null) {
  return useQuery({
    queryKey: ["/api/classrooms", locationId],
    queryFn: () => fetchApi<Classroom[]>(`/api/classrooms?locationId=${locationId}`),
    enabled: !!locationId,
    refetchInterval: 30000, // Poll every 30s
  });
}
