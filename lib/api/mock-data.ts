import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

export let MOCK_CATEGORIES: Category[] = [
  // Top-level: Bags
  {
    id: "cat-bags",
    name: "Bags",
    slug: "bags",
    description: "Handcrafted everyday leather bags designed for durability and quiet luxury.",
    parentId: null,
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "cat-satchels",
    name: "Satchels",
    slug: "satchels",
    description: "Structured top-handle satchels with timeless silhouettes.",
    parentId: "cat-bags",
    createdAt: "2026-01-10T10:05:00.000Z",
  },
  {
    id: "cat-totes",
    name: "Totes",
    slug: "totes",
    description: "Spacious everyday carry totes built for work and travel.",
    parentId: "cat-bags",
    createdAt: "2026-01-10T10:10:00.000Z",
  },
  {
    id: "cat-crossbody",
    name: "Crossbody",
    slug: "crossbody",
    description: "Compact hands-free crossbody bags with adjustable straps.",
    parentId: "cat-bags",
    createdAt: "2026-01-10T10:15:00.000Z",
  },
  {
    id: "cat-backpacks",
    name: "Backpacks",
    slug: "backpacks",
    description: "Minimalist leather daypacks tailored for modern commuters.",
    parentId: "cat-bags",
    createdAt: "2026-01-10T10:20:00.000Z",
  },

  // Top-level: Small Leather Goods
  {
    id: "cat-slg",
    name: "Small Leather Goods",
    slug: "small-leather-goods",
    description: "Fine leather pocket accessories, card holders, and wallets.",
    parentId: null,
    createdAt: "2026-01-12T09:00:00.000Z",
  },
  {
    id: "cat-wallets",
    name: "Wallets",
    slug: "wallets",
    description: "Bifold and zip-around classic leather wallets.",
    parentId: "cat-slg",
    createdAt: "2026-01-12T09:05:00.000Z",
  },
  {
    id: "cat-card-holders",
    name: "Card Holders",
    slug: "card-holders",
    description: "Ultra-slim card cases for front pocket carry.",
    parentId: "cat-slg",
    createdAt: "2026-01-12T09:10:00.000Z",
  },
  {
    id: "cat-key-pouches",
    name: "Key Pouches",
    slug: "key-pouches",
    description: "Protective leather key wraps and pouches.",
    parentId: "cat-slg",
    createdAt: "2026-01-12T09:15:00.000Z",
  },

  // Top-level: Travel
  {
    id: "cat-travel",
    name: "Travel",
    slug: "travel",
    description: "Durable weekenders and luggage made for long journeys.",
    parentId: null,
    createdAt: "2026-01-15T08:00:00.000Z",
  },
  {
    id: "cat-duffels",
    name: "Duffels",
    slug: "duffels",
    description: "Full-grain leather carry-on duffels.",
    parentId: "cat-travel",
    createdAt: "2026-01-15T08:05:00.000Z",
  },
  {
    id: "cat-weekenders",
    name: "Weekenders",
    slug: "weekenders",
    description: "Roomy overnight travel bags with reinforced bases.",
    parentId: "cat-travel",
    createdAt: "2026-01-15T08:10:00.000Z",
  },
];

export function setMockCategories(categories: Category[]) {
  MOCK_CATEGORIES = categories;
}

export let MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "The Satchel",
    description: "A structured everyday satchel in full-grain leather.",
    price: 4200,
    categoryId: "cat-satchels",
    categoryName: "Satchels",
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
    categoryId: "cat-totes",
    categoryName: "Totes",
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
    categoryId: "cat-crossbody",
    categoryName: "Crossbody",
    isFeatured: true,
    variants: [{ id: "v5", color: "Tan", stock: 2 }],
    createdAt: new Date().toISOString(),
  },
];

export function setMockProducts(products: Product[]) {
  MOCK_PRODUCTS = products;
}