// Pre-orders have NO confirmed backend endpoints or DTOs yet (per
// PROJECT_STATUS.md — "this needs a 'what does a pre-order actually look
// like' conversation before it can be built for real"). Everything in this
// file is a best-guess mirror of the real, confirmed Order shape in
// types/order.ts, so the admin UI has something to work against today.
// Once your backend friend defines the real pre-order API, update this file
// and lib/api/preorders.ts to match — the same way types/order.ts and
// lib/api/orders.ts were rewritten once orders were confirmed live.

import { ORDER_SOURCES, type OrderSource } from "@/types/order";

// Guessed — mirrors ORDER_STATUSES. A pre-order likely wants its own states
// (e.g. "awaiting stock", "ready to ship") rather than "shipped"/"delivered",
// but until that's confirmed this keeps the same 5 states so the rest of the
// UI (status badge, status select) can be reused as-is.
export const PREORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type PreorderStatus = (typeof PREORDER_STATUSES)[number];

export { ORDER_SOURCES as PREORDER_SOURCES };
export type PreorderSource = OrderSource;

export interface PreorderItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Preorder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  billingAddress?: string;
  districtId: string;
  districtName: string;
  thanaId?: string;
  thanaName?: string;
  source: PreorderSource;
  specialNotes?: string;
  status: PreorderStatus;
  cancellationReason?: string;
  items: PreorderItem[];
  total: number;
  createdAt: string;
}

export interface CreatePreorderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  billingAddress?: string;
  districtId: string;
  thanaId?: string;
  source: PreorderSource;
  specialNotes?: string;
  items: { productId: string; variantId?: string; quantity: number }[];
}

export interface UpdatePreorderStatusInput {
  status: PreorderStatus;
  note?: string;
  cancellationReason?: string;
}