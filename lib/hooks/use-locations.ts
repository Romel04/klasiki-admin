import { useQuery } from "@tanstack/react-query";
import { getDistricts, getThanas } from "@/lib/api/locations";

export function useDistricts() {
  return useQuery({ queryKey: ["districts"], queryFn: getDistricts });
}

export function useThanas(districtId: string) {
  return useQuery({
    queryKey: ["districts", districtId, "thanas"],
    queryFn: () => getThanas(districtId),
    enabled: !!districtId,
  });
}