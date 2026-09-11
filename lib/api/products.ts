import type { Product, CreateProductInput } from "@/types/product";
import { MOCK_PRODUCTS, setMockProducts } from "./mock-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
const MOCK_CATEGORY_NAME = "Bags"; // matches the mock category used in the form for now

export async function getProducts(): Promise<Product[]> {
  if (USE_MOCKS) return MOCK_PRODUCTS;

  const res = await fetch(`${API_URL}/products`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getProduct(id: string): Promise<Product> {
  if (USE_MOCKS) {
    const found = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!found) throw new Error("Product not found");
    return found;
  }

  const res = await fetch(`${API_URL}/products/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  if (USE_MOCKS) {
    const newProduct: Product = {
      ...data,
      id: crypto.randomUUID(),
      categoryName: MOCK_CATEGORY_NAME,
      createdAt: new Date().toISOString(),
    };
    setMockProducts([...MOCK_PRODUCTS, newProduct]);
    return newProduct;
  }

  const res = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
}

export async function updateProduct(id: string, data: Partial<CreateProductInput>): Promise<Product> {
  if (USE_MOCKS) {
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Product not found");
    const updated = { ...MOCK_PRODUCTS[index], ...data };
    const next = [...MOCK_PRODUCTS];
    next[index] = updated;
    setMockProducts(next);
    return updated;
  }

  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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

  const res = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete product");
}