import type { Product, CreateProductInput } from "@/types/product";
import { MOCK_PRODUCTS, setMockProducts, MOCK_CATEGORIES } from "./mock-data";
import { apiFetch } from "@/lib/api/http";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export async function getProducts(): Promise<Product[]> {
  if (USE_MOCKS) return MOCK_PRODUCTS;

  const res = await apiFetch("/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getProduct(id: string): Promise<Product> {
  if (USE_MOCKS) {
    const found = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!found) throw new Error("Product not found");
    return found;
  }

  const res = await apiFetch(`/products/${id}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  if (USE_MOCKS) {
    const matchedCategory = MOCK_CATEGORIES.find((c) => c.id === data.categoryId);
    const newProduct: Product = {
      ...data,
      id: crypto.randomUUID(),
      categoryName: matchedCategory ? matchedCategory.name : "Uncategorized",
      createdAt: new Date().toISOString(),
    };
    setMockProducts([...MOCK_PRODUCTS, newProduct]);
    return newProduct;
  }

  const res = await apiFetch("/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function updateProduct(id: string, data: Partial<CreateProductInput>): Promise<Product> {
  if (USE_MOCKS) {
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Product not found");
    let categoryName = MOCK_PRODUCTS[index].categoryName;
    if (data.categoryId) {
      const matched = MOCK_CATEGORIES.find((c) => c.id === data.categoryId);
      if (matched) categoryName = matched.name;
    }
    const updated = { ...MOCK_PRODUCTS[index], ...data, categoryName };
    const next = [...MOCK_PRODUCTS];
    next[index] = updated;
    setMockProducts(next);
    return updated;
  }

  const res = await apiFetch(`/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update product");
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  if (USE_MOCKS) {
    setMockProducts(MOCK_PRODUCTS.filter((p) => p.id !== id));
    return;
  }

  const res = await apiFetch(`/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
}