import { useQuery } from "@tanstack/react-query";
import { getActivityLogs } from "@/lib/api/activity-log";

export function useActivityLogs() {
  return useQuery({ queryKey: ["activity-logs"], queryFn: getActivityLogs });
}