import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPreorders, getPreorder, createPreorder, updatePreorderStatus } from "@/lib/api/preorders";
import type { UpdatePreorderStatusInput } from "@/types/preorder";

export function usePreorders() {
  return useQuery({ queryKey: ["preorders"], queryFn: getPreorders });
}

export function usePreorder(id: string) {
  return useQuery({
    queryKey: ["preorders", id],
    queryFn: () => getPreorder(id),
    enabled: !!id,
  });
}

export function useCreatePreorder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPreorder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preorders"] });
    },
  });
}

export function useUpdatePreorderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePreorderStatusInput }) => updatePreorderStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["preorders"] });
      queryClient.invalidateQueries({ queryKey: ["preorders", id] });
    },
  });
}