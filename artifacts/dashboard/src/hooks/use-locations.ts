import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./use-api";
import { Location } from "@/types/schema";

export function useLocations() {
  return useQuery({
    queryKey: ["/api/locations"],
    queryFn: () => fetchApi<Location[]>("/api/locations"),
  });
}
