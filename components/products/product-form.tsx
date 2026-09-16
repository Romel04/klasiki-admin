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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Delete02Icon } from "@hugeicons/core-free-icons";

import { useCategories } from "@/lib/hooks/use-categories";

interface ProductFormProps {
  defaultValues?: Partial<ProductFormInput>;
  onSubmit: (values: ProductFormValues) => void;
  isSubmitting?: boolean;
}

function sanitizePrice(value: string): string {
  // Remove any character that is not a digit or decimal point
  let clean = value.replace(/[^0-9.]/g, "");

  // Only allow a single decimal point
  const dotIndex = clean.indexOf(".");
  if (dotIndex !== -1) {
    clean =
      clean.slice(0, dotIndex + 1) +
      clean.slice(dotIndex + 1).replace(/\./g, "");
  }

  // If starts with ".", prepend 0
  if (clean.startsWith(".")) {
    clean = "0" + clean;
  }

  // Handle leading zeroes
  if (clean.includes(".")) {
    const [intPart, decPart] = clean.split(".");
    const normalizedInt = intPart.replace(/^0+(?=\d)/, "");
    clean = (normalizedInt || "0") + "." + decPart;
  } else {
    // Integer only: remove leading zeroes (e.g. "05" -> "5", "00" -> "0")
    if (clean.length > 1 && clean.startsWith("0")) {
      clean = clean.replace(/^0+/, "") || "0";
    }
  }

  return clean;
}

function sanitizeStock(value: string): string {
  // Stock cannot have decimals, signs, symbols or letters: whole numbers only
  const integerOnly = value.split(".")[0];
  let clean = integerOnly.replace(/[^0-9]/g, "");

  // Strip leading zeroes (e.g. "05" -> "5", "00" -> "0")
  if (clean.length > 1 && clean.startsWith("0")) {
    clean = clean.replace(/^0+/, "") || "0";
  }

  return clean;
}

export function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: ProductFormProps) {
  const router = useRouter();
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();

  const topLevelCategories = categories?.filter((c) => !c.parentId) || [];
  const subcategories = categories?.filter((c) => c.parentId) || [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "" as unknown as number,
      categoryId: "",
      isFeatured: false,
      variants: [{ color: "", stock: "" as unknown as number }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation and system shortcuts
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "Escape" ||
      e.key === "Enter" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // Disallow typing 0 if the field already has a lone 0
    if (e.key === "0" && e.currentTarget.value === "0") {
      e.preventDefault();
      return;
    }

    // If the field is currently just "0", typing 1-9 replaces the 0
    if (e.currentTarget.value === "0" && /^[1-9]$/.test(e.key)) {
      e.currentTarget.value = "";
      return;
    }

    // Allow decimal point only if not already present
    if (e.key === "." && !e.currentTarget.value.includes(".")) {
      return;
    }

    // Allow digits 0-9
    if (/^[0-9]$/.test(e.key)) {
      return;
    }

    // Block everything else (+, -, e, E, letters, symbols, second dot)
    e.preventDefault();
  };

  const handleStockKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation and system shortcuts
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "Escape" ||
      e.key === "Enter" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // Disallow typing 0 if the field already has a lone 0
    if (e.key === "0" && e.currentTarget.value === "0") {
      e.preventDefault();
      return;
    }

    // If the field is currently just "0", typing 1-9 replaces the 0
    if (e.currentTarget.value === "0" && /^[1-9]$/.test(e.key)) {
      e.currentTarget.value = "";
      return;
    }

    // Allow digits 0-9 only (no dot, no signs, no letters)
    if (/^[0-9]$/.test(e.key)) {
      return;
    }

    // Block everything else
    e.preventDefault();
  };

  const { onChange: onPriceChange, onBlur: onPriceBlur, ...priceRegister } =
    register("price");

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
          <Input
            type="number"
            step="any"
            min="0"
            placeholder="0.00"
            {...priceRegister}
            onChange={(e) => {
              const clean = sanitizePrice(e.target.value);
              e.target.value = clean;
              onPriceChange(e);
            }}
            onBlur={(e) => {
              if (e.target.value.endsWith(".")) {
                e.target.value = e.target.value.slice(0, -1);
              }
              onPriceBlur(e);
            }}
            onKeyDown={handlePriceKeyDown}
          />
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
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isCategoriesLoading
                    ? "Loading categories..."
                    : "Select a category"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {isCategoriesLoading ? (
                <div className="p-3 text-sm text-muted-foreground">
                  Loading categories...
                </div>
              ) : topLevelCategories.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  No categories found
                </div>
              ) : (
                topLevelCategories.map((parent, idx) => {
                  const children = subcategories.filter(
                    (c) => c.parentId === parent.id,
                  );
                  return (
                    <SelectGroup key={parent.id}>
                      {idx > 0 && <SelectSeparator />}
                      <SelectLabel>
                        {parent.name}
                      </SelectLabel>
                      <SelectItem value={parent.id} className="font-medium">
                        {parent.name} (General)
                      </SelectItem>
                      {children.map((child) => (
                        <SelectItem
                          key={child.id}
                          value={child.id}
                          className="pl-6 text-foreground/90"
                        >
                          <span className="text-muted-foreground/60 mr-1.5 select-none">↳</span>
                          <span>{child.name}</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })
              )}
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
            onClick={() => append({ color: "", stock: "" as unknown as number })}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} />
            Add Color
          </Button>
        </div>

        {fields.map((field, index) => {
          const { onChange: onStockChange, ...stockRegister } =
            register(`variants.${index}.stock`);

          return (
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
                  min="0"
                  step="1"
                  placeholder="0"
                  {...stockRegister}
                  onChange={(e) => {
                    const clean = sanitizeStock(e.target.value);
                    e.target.value = clean;
                    onStockChange(e);
                  }}
                  onKeyDown={handleStockKeyDown}
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
          );
        })}
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
