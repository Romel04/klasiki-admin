"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CategoryForm } from "@/components/categories/category-form";
import { useCategory, useUpdateCategory } from "@/lib/hooks/use-categories";
import type { CategoryFormValues } from "@/lib/validators/category";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: category, isPending, error } = useCategory(id);
  const updateCategory = useUpdateCategory();

  function handleSubmit(values: CategoryFormValues) {
    updateCategory.mutate(
      {
        id,
        data: {
          name: values.name,
          slug: values.slug,
          description: values.description,
          parentId: values.parentId,
        },
      },
      {
        onSuccess: (updated) => {
          toast.success(`Category "${updated.name}" updated successfully`);
          router.push("/categories");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update category");
        },
      },
    );
  }

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading category...</p>;
  }

  if (error || !category) {
    return <p className="text-sm text-destructive">Failed to load category.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Edit Category</h1>
        <p className="text-xs text-muted-foreground">
          Update category details, slug, or parent grouping.
        </p>
      </div>
      <CategoryForm
        key={category.id}
        categoryId={category.id}
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          parentId: category.parentId || null,
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateCategory.isPending}
      />
    </div>
  );
}
