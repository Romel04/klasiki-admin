import type { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types/category";
import { MOCK_CATEGORIES, setMockCategories } from "./mock-data";
import { apiFetch } from "@/lib/api/http";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

interface ApiCategory {
  id: number;
  name: string;
  parent_id: number | null;
  image_url: string | null;
  is_active: boolean;
}

function fromApi(c: ApiCategory): Category {
  return {
    id: String(c.id),
    name: c.name,
    parentId: c.parent_id !== null ? String(c.parent_id) : null,
    imageUrl: c.image_url,
    isActive: c.is_active,
  };
}

function toApiPayload(data: Partial<CreateCategoryInput & { isActive: boolean }>) {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.parentId !== undefined) payload.parent_id = data.parentId ? Number(data.parentId) : null;
  if (data.imageUrl !== undefined) payload.image_url = data.imageUrl || undefined;
  if ("isActive" in data && data.isActive !== undefined) payload.is_active = data.isActive;
  return payload;
}

export async function getCategories(): Promise<Category[]> {
  if (USE_MOCKS) return MOCK_CATEGORIES;

  const res = await apiFetch("/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data: ApiCategory[] = await res.json();
  return data.map(fromApi);
}

export async function getCategory(id: string): Promise<Category> {
  if (USE_MOCKS) {
    const found = MOCK_CATEGORIES.find((c) => c.id === id);
    if (!found) throw new Error("Category not found");
    return found;
  }

  const res = await apiFetch(`/categories/${id}`);
  if (!res.ok) throw new Error("Failed to fetch category");
  const data: ApiCategory = await res.json();
  return fromApi(data);
}

export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  if (USE_MOCKS) {
    const newCategory: Category = {
      ...data,
      id: crypto.randomUUID(),
      parentId: data.parentId || null,
    };
    setMockCategories([...MOCK_CATEGORIES, newCategory]);
    return newCategory;
  }

  const res = await apiFetch("/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiPayload(data)),
  });
  if (!res.ok) throw new Error("Failed to create category");
  const created: ApiCategory = await res.json();
  return fromApi(created);
}

export async function updateCategory(id: string, data: UpdateCategoryInput): Promise<Category> {
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

  const res = await apiFetch(`/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiPayload(data)),
  });
  if (!res.ok) throw new Error("Failed to update category");
  const updated: ApiCategory = await res.json();
  return fromApi(updated);
}

export async function deleteCategory(id: string): Promise<void> {
  if (USE_MOCKS) {
    const next = MOCK_CATEGORIES.filter((c) => c.id !== id).map((c) =>
      c.parentId === id ? { ...c, parentId: null } : c,
    );
    setMockCategories(next);
    return;
  }

  const res = await apiFetch(`/categories/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete category");
}