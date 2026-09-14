export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  createdAt: string;
}

export type CreateCategoryInput = Omit<Category, "id" | "createdAt">;
