"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductForm } from "@/components/products/product-form";
import { useCreateProduct } from "@/lib/hooks/use-products";
import type { ProductFormValues } from "@/lib/validators/product";

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  function handleSubmit(values: ProductFormValues) {
    createProduct.mutate(
      {
        name: values.name,
        description: values.description,
        price: values.price,
        categoryId: values.categoryId,
        isFeatured: values.isFeatured,
        variants: values.variants.map((v) => ({
          id: v.id ?? `new-${crypto.randomUUID()}`,
          color: v.color,
          stock: v.stock,
        })),
      },
      {
        onSuccess: (product) => {
          toast.success(`Product "${product.name}" created successfully`);
          router.push("/products");
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to create product",
          );
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Add Product</h1>
      <ProductForm
        onSubmit={handleSubmit}
        isSubmitting={createProduct.isPending}
      />
    </div>
  );
}
