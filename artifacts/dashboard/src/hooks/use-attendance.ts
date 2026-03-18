import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "./use-api";

export interface ImportResult {
  snapshotId: string;
  entriesCount: number;
  warnings: string[];
  entries: {
    staffName: string;
    classroom: string;
    status: string;
    loggedInAt: string | null;
  }[];
}

export function useImportAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { locationId: string; rawText: string }) =>
      fetchApi<ImportResult>("/api/attendance-imports/tadpoles", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/classrooms", variables.locationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff", variables.locationId] });
    },
  });
}
