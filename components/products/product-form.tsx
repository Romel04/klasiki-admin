"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  productFormSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/lib/validators/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Delete02Icon } from "@hugeicons/core-free-icons";

// Replace with real categories once the categories endpoint exists
const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Bags" },
  { id: "cat-2", name: "Totes" },
];

interface ProductFormProps {
  defaultValues?: Partial<ProductFormInput>;
  onSubmit: (values: ProductFormValues) => void;
  isSubmitting?: boolean;
}

export function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: ProductFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput, any, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      isFeatured: false,
      variants: [{ color: "", stock: 0 }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="space-y-1">
        <Label>Product Name</Label>
        <Input {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea {...register("description")} rows={4} />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Price (৳)</Label>
          <Input type="number" step="0.01" {...register("price")} />
          {errors.price && (
            <p className="text-xs text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Category</Label>
          <Select
            value={watch("categoryId")}
            onValueChange={(value) => setValue("categoryId", value ?? "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-xs text-destructive">
              {errors.categoryId.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={watch("isFeatured")}
          onCheckedChange={(checked) => setValue("isFeatured", checked)}
        />
        <Label>Show in Featured/Trending section</Label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Color Variants & Stock</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => append({ color: "", stock: 0 })}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} />
            Add Color
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                placeholder="e.g. Tan"
                {...register(`variants.${index}.color`)}
              />
            </div>
            <div className="w-28">
              <Input
                type="number"
                placeholder="Stock"
                {...register(`variants.${index}.stock`)}
              />
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={fields.length === 1}
              onClick={() => remove(index)}
            >
              <HugeiconsIcon
                icon={Delete02Icon}
                size={16}
                className="text-destructive"
              />
            </Button>
          </div>
        ))}
        {errors.variants && (
          <p className="text-xs text-destructive">{errors.variants.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
