// Confirmed from Swagger UpdateOrderStatusDto: exactly these 5 values, no
// separate "processing" step.
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// NOT a real backend field — confirmed from Swagger that CreateOrderDto has
// no source/channel field at all. We fold this into `special_notes` as a
// "Source: X" prefix (see buildSpecialNotes/splitSpecialNotes in
// lib/api/orders.ts) so it's still tracked without inventing a DTO field
// that doesn't exist.
export const ORDER_SOURCES = ["website", "facebook", "whatsapp", "phone", "other"] as const;
export type OrderSource = (typeof ORDER_SOURCES)[number];

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  // Confirmed: product_variant_id is OPTIONAL on CreateOrderItemDto — an
  // order can reference a product without a specific variant.
  variantId?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  // Confirmed live: the backend returns its own computed total_price per
  // line — use this for display rather than unitPrice * quantity, in case a
  // per-item discount is ever applied that a simple multiply wouldn't catch.
  totalPrice: number;
}

export interface Order {
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
  source: OrderSource;
  specialNotes?: string;
  status: OrderStatus;
  cancellationReason?: string;
  // Internal-only note for admins (e.g. "this order is from the Sept 12
  // shipment"). Never shown to the customer or on the storefront — only on
  // this order's detail page. NOT a confirmed backend field yet — see the
  // note above updateOrderAdminNote in lib/api/orders.ts.
  adminNote?: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  billingAddress?: string;
  districtId: string;
  thanaId?: string;
  source: OrderSource;
  specialNotes?: string;
  items: { productId: string; variantId?: string; quantity: number }[];
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  // Confirmed: free-text, stored in a status history — separate from
  // cancellation_reason.
  note?: string;
  // Confirmed: required by the backend specifically when status is "cancelled".
  cancellationReason?: string;
}