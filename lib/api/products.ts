import type { Product, ProductVariant, CreateProductInput, UpdateProductInput } from "@/types/product";
import { MOCK_PRODUCTS, setMockProducts, MOCK_CATEGORIES } from "./mock-data";
import { apiFetch, apiJson } from "@/lib/api/http";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

// --- Real API shapes -------------------------------------------------------
// Confirmed from Swagger: product_variants has id, product_id, name, attributes
// (JSONB), price, discount_price, stock_qty, is_active, created_at, updated_at.
// Variants are sub-resources: POST /products/{id}/variants is confirmed in
// Swagger. PATCH/DELETE at /products/{id}/variants/{variantId} are NOT yet
// confirmed against Swagger — they're assumed here to mirror the top-level
// /products/{id} pattern. Please check Swagger and adjust the two call sites
// below (updateProductVariant / deleteProductVariant) if the real paths differ.

interface ApiVariant {
  id: number;
  product_id: number;
  name: string;
  attributes: Record<string, string> | null;
  price: number | null;
  discount_price: number | null;
  stock_qty: number;
  is_active: boolean;
}

interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  category_id: string;
  category?: { id: number; name: string };
  is_featured: boolean;
  stock_qty: number;
  // Field name for the nested variant list on GET isn't confirmed against a
  // live response yet — checking both common shapes defensively.
  variants?: ApiVariant[];
  product_variants?: ApiVariant[];
  // Confirmed live from GET /products/{id}: this is the actual key.
  productVariants?: ApiVariant[];
  created_at: string;
}

function fromApiVariant(v: ApiVariant): ProductVariant {
  return {
    id: String(v.id),
    color: v.attributes?.color ?? v.name,
    stock: v.stock_qty,
  };
}

function fromApiProduct(p: ApiProduct, variantsOverride?: ApiVariant[]): Product {
  const rawVariants = variantsOverride ?? p.productVariants ?? p.variants ?? p.product_variants ?? [];
  return {
    id: String(p.id),
    name: p.name,
    description: p.description,
    // Confirmed live: the backend returns price as a string ("1500.00"), not
    // a number, despite the DTO — coerce defensively so math/formatting works.
    price: Number(p.price),
    categoryId: String(p.category_id),
    categoryName: p.category?.name ?? "Uncategorized",
    isFeatured: p.is_featured,
    variants: rawVariants.map(fromApiVariant),
    // Confirmed live and accurate (matched sum of variant stock on creation) —
    // use this rather than summing `variants`, since /products (list) doesn't
    // return nested variant data at all.
    stockQty: p.stock_qty,
    createdAt: p.created_at,
  };
}

// Base product fields only — variants are created/updated/deleted separately
// via their own sub-resource endpoints, not embedded in this payload.
function toProductPayload(data: Partial<CreateProductInput>) {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.price !== undefined) payload.price = data.price;
  if (data.categoryId !== undefined) payload.category_id = Number(data.categoryId);
  if (data.isFeatured !== undefined) payload.is_featured = data.isFeatured;
  // The base product also carries its own top-level stock_qty per the DTO.
  // Decision: keep it in sync as the sum of variant stock, since for bags
  // stock is tracked per-color, not at the product level. Flag to confirm
  // this matches how the backend/reports expect it to be used.
  if (data.variants !== undefined) {
    payload.stock_qty = data.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  return payload;
}

function toVariantPayload(v: { color: string; stock: number }) {
  return {
    name: v.color,
    attributes: { color: v.color },
    stock_qty: v.stock,
  };
}

async function createProductVariant(productId: string, v: { color: string; stock: number }): Promise<ApiVariant> {
  return apiJson<ApiVariant>(
    `/products/${productId}/variants`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toVariantPayload(v)),
    },
    `Failed to create variant "${v.color}"`,
  );
}

// Path unconfirmed — see note above ApiVariant.
async function updateProductVariant(
  productId: string,
  variantId: string,
  v: { color: string; stock: number },
): Promise<ApiVariant> {
  return apiJson<ApiVariant>(
    `/products/${productId}/variants/${variantId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toVariantPayload(v)),
    },
    `Failed to update variant "${v.color}"`,
  );
}

// Path unconfirmed — see note above ApiVariant.
async function deleteProductVariant(productId: string, variantId: string): Promise<void> {
  const res = await apiFetch(`/products/${productId}/variants/${variantId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete a removed variant");
}

// --- Public API --------------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  if (USE_MOCKS) return MOCK_PRODUCTS;

  const data = await apiJson<ApiProduct[]>("/products", {}, "Failed to fetch products");
  return data.map((p) => fromApiProduct(p));
}

export async function getProduct(id: string): Promise<Product> {
  if (USE_MOCKS) {
    const found = MOCK_PRODUCTS.find((p) => p.id === id);
    if (!found) throw new Error("Product not found");
    return found;
  }

  const data = await apiJson<ApiProduct>(`/products/${id}`, {}, "Failed to fetch product");
  return fromApiProduct(data);
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  if (USE_MOCKS) {
    const matchedCategory = MOCK_CATEGORIES.find((c) => c.id === data.categoryId);
    const newProduct: Product = {
      ...data,
      id: crypto.randomUUID(),
      categoryName: matchedCategory ? matchedCategory.name : "Uncategorized",
      stockQty: data.variants.reduce((sum, v) => sum + v.stock, 0),
      createdAt: new Date().toISOString(),
    };
    setMockProducts([...MOCK_PRODUCTS, newProduct]);
    return newProduct;
  }

  // 1. Create the base product first — the real API doesn't accept variants
  //    embedded in this payload.
  const created = await apiJson<ApiProduct>(
    "/products",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toProductPayload(data)),
    },
    "Failed to create product",
  );

  // 2. Add each color as its own variant now that the product has an id.
  const createdVariants = await Promise.all(
    data.variants.map((v) => createProductVariant(String(created.id), v)),
  );

  return fromApiProduct(created, createdVariants);
}

export async function updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
  if (USE_MOCKS) {
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Product not found");
    let categoryName = MOCK_PRODUCTS[index].categoryName;
    if (data.categoryId) {
      const matched = MOCK_CATEGORIES.find((c) => c.id === data.categoryId);
      if (matched) categoryName = matched.name;
    }
    const updated = {
      ...MOCK_PRODUCTS[index],
      ...data,
      categoryName,
      stockQty: data.variants
        ? data.variants.reduce((sum, v) => sum + v.stock, 0)
        : MOCK_PRODUCTS[index].stockQty,
    };
    const next = [...MOCK_PRODUCTS];
    next[index] = updated;
    setMockProducts(next);
    return updated;
  }

  // 1. Update the base product fields.
  const updated = await apiJson<ApiProduct>(
    `/products/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toProductPayload(data)),
    },
    "Failed to update product",
  );

  // 2. Reconcile variants: existing real ids get PATCHed, "new-…" placeholder
  //    ids get POSTed as new variants, and anything the caller flagged as
  //    removed gets DELETEd.
  let finalVariants: ApiVariant[] = [];
  if (data.variants !== undefined) {
    await Promise.all(
      (data.removedVariantIds ?? []).map((variantId) => deleteProductVariant(id, variantId)),
    );

    finalVariants = await Promise.all(
      data.variants.map((v) => {
        const isNew = !v.id || v.id.startsWith("new-");
        return isNew ? createProductVariant(id, v) : updateProductVariant(id, v.id!, v);
      }),
    );
  }

  return fromApiProduct(updated, data.variants !== undefined ? finalVariants : undefined);
}

export async function deleteProduct(id: string): Promise<void> {
  if (USE_MOCKS) {
    setMockProducts(MOCK_PRODUCTS.filter((p) => p.id !== id));
    return;
  }

  const res = await apiFetch(`/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product");
}