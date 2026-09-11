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
  createdAt: string;
}

export type CreateProductInput = Omit<Product, "id" | "categoryName" | "createdAt">;