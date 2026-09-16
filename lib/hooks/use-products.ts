import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from "@/lib/api/products";
import type { CreateProductInput } from "@/types/product";

export function useProducts() {
  return useQuery({ queryKey: ["products"], queryFn: getProducts });
}

export function useProduct(id: string) {
  return useQuery({ queryKey: ["products", id], queryFn: () => getProduct(id), enabled: !!id });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductInput> }) => updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}