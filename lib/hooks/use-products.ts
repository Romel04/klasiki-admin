import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from "@/lib/api/products";
import { useCategories } from "@/lib/hooks/use-categories";
import type { UpdateProductInput } from "@/types/product";

// The real /products endpoint doesn't return a nested category object, only
// category_id — so categoryName from the API layer is just a placeholder
// ("Uncategorized"). Join against the already-cached categories list here to
// show the real name, without every consumer of useProducts needing to do it.
export function useProducts() {
  const productsQuery = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const categoriesQuery = useCategories();

  const data = productsQuery.data?.map((product) => {
    const category = categoriesQuery.data?.find((c) => c.id === product.categoryId);
    return category ? { ...product, categoryName: category.name } : product;
  });

  return { ...productsQuery, data };
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
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) => updateProduct(id, data),
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