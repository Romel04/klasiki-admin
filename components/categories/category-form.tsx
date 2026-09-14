"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  categoryFormSchema,
  type CategoryFormInput,
  type CategoryFormValues,
} from "@/lib/validators/category";
import { useCategories } from "@/lib/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFormProps {
  categoryId?: string; // If editing an existing category
  defaultValues?: Partial<CategoryFormInput>;
  onSubmit: (values: CategoryFormValues) => void;
  isSubmitting?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryForm({
  categoryId,
  defaultValues,
  onSubmit,
  isSubmitting,
}: CategoryFormProps) {
  const router = useRouter();
  const { data: allCategories } = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: null,
      ...defaultValues,
    },
  });

  const nameValue = watch("name");
  const parentIdValue = watch("parentId");

  // Auto-generate slug when name changes if user hasn't manually edited slug
  useEffect(() => {
    if (!touchedFields.slug && nameValue && !defaultValues?.slug) {
      setValue("slug", slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, touchedFields.slug, setValue, defaultValues?.slug]);

  // Only top-level categories can be parents, and a category cannot be its own parent
  const eligibleParents =
    allCategories?.filter((c) => !c.parentId && c.id !== categoryId) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="space-y-1">
        <Label>Category Name</Label>
        <Input
          placeholder="e.g. Travel"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Slug</Label>
        <Input
          placeholder="e.g. travel"
          {...register("slug")}
        />
        <p className="text-[11px] text-muted-foreground">
          Used in storefront URLs (lowercase letters, numbers, and hyphens only).
        </p>
        {errors.slug && (
          <p className="text-xs text-destructive">{errors.slug.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Parent Category</Label>
        <Select
          value={parentIdValue || "none"}
          onValueChange={(val) => {
            setValue("parentId", val === "none" ? null : val, {
              shouldValidate: true,
            });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select parent category" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="none">
              None (Top-level Category)
            </SelectItem>
            {eligibleParents.length > 0 && <SelectSeparator />}
            {eligibleParents.map((parent) => (
              <SelectItem key={parent.id} value={parent.id}>
                {parent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          Leave as &quot;None&quot; to create a primary section, or select a parent to create a subcategory.
        </p>
        {errors.parentId && (
          <p className="text-xs text-destructive">{errors.parentId.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea
          placeholder="Brief summary of what products belong in this category..."
          {...register("description")}
          rows={3}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : categoryId ? "Update Category" : "Create Category"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/categories")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
