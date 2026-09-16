export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  // Only present in mock data — the real backend doesn't have these fields.
  slug?: string;
  description?: string;
  createdAt?: string;
}

export interface CreateCategoryInput {
  name: string;
  parentId: string | null;
  imageUrl?: string;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput> & {
  isActive?: boolean;
};