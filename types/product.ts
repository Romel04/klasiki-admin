export interface ProductVariant {
  id: string;
  color: string;
  colorHex?: string;
  stock: number;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  isFeatured: boolean;
  variants: ProductVariant[];
  // The backend's own tracked total (confirmed live: matches the sum of variant
  // stock). Kept separate from `variants` because the /products list endpoint
  // doesn't return nested variant data at all — this field is what's actually
  // reliable to display as "total stock" on the list page.
  stockQty: number;
  createdAt: string;
}

export type CreateProductInput = Omit<Product, "id" | "categoryName" | "createdAt" | "stockQty">;

// removedVariantIds: real backend variant ids that existed on the product before
// this edit but are no longer in `variants` — the real API path DELETEs these.
// Ignored by the mock path (mocks just replace the whole array).
export type UpdateProductInput = Partial<CreateProductInput> & {
  removedVariantIds?: string[];
};