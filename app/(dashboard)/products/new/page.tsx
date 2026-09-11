"use client";

import { useRouter } from "next/navigation";
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
          id: crypto.randomUUID(),
          color: v.color,
          stock: v.stock,
        })),
      },
      { onSuccess: () => router.push("/products") },
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
