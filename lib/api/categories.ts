import type { Category, CreateCategoryInput } from "@/types/category";
import { MOCK_CATEGORIES, setMockCategories } from "./mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export async function getCategories(): Promise<Category[]> {
  if (USE_MOCKS) return MOCK_CATEGORIES;

  const res = await fetch(`${API_URL}/categories`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getCategory(id: string): Promise<Category> {
  if (USE_MOCKS) {
    const found = MOCK_CATEGORIES.find((c) => c.id === id);
    if (!found) throw new Error("Category not found");
    return found;
  }

  const res = await fetch(`${API_URL}/categories/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch category");
  return res.json();
}

export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  if (USE_MOCKS) {
    const newCategory: Category = {
      ...data,
      id: crypto.randomUUID(),
      parentId: data.parentId || null,
      createdAt: new Date().toISOString(),
    };
    setMockCategories([...MOCK_CATEGORIES, newCategory]);
    return newCategory;
  }

  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function updateCategory(
  id: string,
  data: Partial<CreateCategoryInput>,
): Promise<Category> {
  if (USE_MOCKS) {
    const index = MOCK_CATEGORIES.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Category not found");

    const updated: Category = {
      ...MOCK_CATEGORIES[index],
      ...data,
      parentId: data.parentId !== undefined ? (data.parentId || null) : MOCK_CATEGORIES[index].parentId,
    };
    const next = [...MOCK_CATEGORIES];
    next[index] = updated;
    setMockCategories(next);
    return updated;
  }

  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  if (USE_MOCKS) {
    // If deleted category had subcategories, unparent them
    const next = MOCK_CATEGORIES.filter((c) => c.id !== id).map((c) =>
      c.parentId === id ? { ...c, parentId: null } : c,
    );
    setMockCategories(next);
    return;
  }

  const res = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete category");
}
