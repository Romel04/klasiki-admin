import type { Product } from "@/types/product";

export let MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "The Satchel",
    description: "A structured everyday satchel in full-grain leather.",
    price: 4200,
    categoryId: "cat-1",
    categoryName: "Bags",
    isFeatured: true,
    variants: [
      { id: "v1", color: "Tan", stock: 8 },
      { id: "v2", color: "Black", stock: 3 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "The Tote",
    description: "Spacious canvas-and-leather tote for daily carry.",
    price: 3600,
    categoryId: "cat-1",
    categoryName: "Bags",
    isFeatured: false,
    variants: [
      { id: "v3", color: "Black", stock: 0 },
      { id: "v4", color: "Olive", stock: 12 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "The Crossbody",
    description: "Compact crossbody with an adjustable strap.",
    price: 2900,
    categoryId: "cat-1",
    categoryName: "Bags",
    isFeatured: true,
    variants: [{ id: "v5", color: "Tan", stock: 2 }],
    createdAt: new Date().toISOString(),
  },
];

export function setMockProducts(products: Product[]) {
  MOCK_PRODUCTS = products;
}