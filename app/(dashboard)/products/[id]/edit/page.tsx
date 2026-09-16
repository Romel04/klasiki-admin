"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProductForm } from "@/components/products/product-form";
import { useProduct, useUpdateProduct } from "@/lib/hooks/use-products";
import type { ProductFormValues } from "@/lib/validators/product";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: product, isPending, error } = useProduct(id);
  const updateProduct = useUpdateProduct();

  function handleSubmit(values: ProductFormValues) {
    updateProduct.mutate(
      {
        id,
        data: {
          name: values.name,
          description: values.description,
          price: values.price,
          categoryId: values.categoryId,
          isFeatured: values.isFeatured,
          variants: values.variants.map((v, index) => ({
            id: product?.variants[index]?.id ?? crypto.randomUUID(),
            color: v.color,
            stock: v.stock,
          })),
        },
      },
      {
        onSuccess: (updated) => {
          toast.success(`Product "${updated.name}" updated successfully`);
          router.push("/products");
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to update product",
          );
        },
      },
    );
  }

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading product...</p>;
  }

  if (error || !product) {
    return <p className="text-sm text-destructive">Failed to load product.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Edit Product</h1>
      <ProductForm
        key={product.id}
        defaultValues={{
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          isFeatured: product.isFeatured,
          variants: product.variants.map((v) => ({
            color: v.color,
            stock: v.stock,
          })),
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateProduct.isPending}
      />
    </div>
  );
}
