"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryForm } from "@/components/categories/category-form";
import { useCreateCategory } from "@/lib/hooks/use-categories";
import type { CategoryFormValues } from "@/lib/validators/category";

function NewCategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get("parentId") || null;
  const createCategory = useCreateCategory();

  function handleSubmit(values: CategoryFormValues) {
    createCategory.mutate(
      {
        name: values.name,
        slug: values.slug,
        description: values.description,
        parentId: values.parentId,
      },
      {
        onSuccess: () => {
          router.push("/categories");
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">
          {parentId ? "Add Subcategory" : "Add Category"}
        </h1>
        <p className="text-xs text-muted-foreground">
          {parentId
            ? "Create a new subcategory nested under the selected parent."
            : "Create a new top-level department or subcategory."}
        </p>
      </div>
      <CategoryForm
        defaultValues={{ parentId }}
        onSubmit={handleSubmit}
        isSubmitting={createCategory.isPending}
      />
    </div>
  );
}

export default function NewCategoryPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading form...</p>}>
      <NewCategoryContent />
    </Suspense>
  );
}
